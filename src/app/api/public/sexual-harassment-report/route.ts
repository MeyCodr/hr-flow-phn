import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/emailService";
import { getComplianceOfficerEmails } from "@/lib/compliance-officers";
import { SexualHarassmentReportTypes } from "@/app/types/types";

const emailFrom = process.env.EMAIL;
const webLink = process.env.NEXTAUTH_URL;

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5;
const submissionsByIp = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionsByIp.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    submissionsByIp.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  submissionsByIp.set(ip, timestamps);
  return false;
}

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("fileAttachment") as File | null;
    const raw = formData.get("data") as string | null;

    if (!raw) {
      return NextResponse.json({ error: "Missing form data" }, { status: 400 });
    }

    const data = JSON.parse(raw) as SexualHarassmentReportTypes;

    // Honeypot - bots tend to fill every field, real users never see this one
    if (data.website) {
      return NextResponse.json({ message: "Report submitted" }, { status: 200 });
    }

    if (!data.reporterName?.trim())
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    if (!data.reporterContact?.trim())
      return NextResponse.json({ error: "Contact number or email is required" }, { status: 400 });
    if (!data.reporterEmail?.trim())
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    if (!data.staffId?.trim())
      return NextResponse.json({ error: "Staff ID is required" }, { status: 400 });
    if (!data.workLocation)
      return NextResponse.json({ error: "Work location is required" }, { status: 400 });
    if (!data.division)
      return NextResponse.json({ error: "Division is required" }, { status: 400 });
    if (!data.department)
      return NextResponse.json({ error: "Department is required" }, { status: 400 });
    if (!data.section)
      return NextResponse.json({ error: "Section is required" }, { status: 400 });
    if (!data.reportAs)
      return NextResponse.json({ error: "Please indicate whether you are the victim or a witness" }, { status: 400 });
    if (!data.perpetratorName?.trim())
      return NextResponse.json({ error: "Perpetrator name is required" }, { status: 400 });
    if (!data.victimName?.trim())
      return NextResponse.json({ error: "Victim name is required" }, { status: 400 });
    if (!data.incidentLocation?.trim())
      return NextResponse.json({ error: "Incident location is required" }, { status: 400 });
    if (!data.incidentDateTime?.trim())
      return NextResponse.json({ error: "Incident date and time is required" }, { status: 400 });
    if (!data.description?.trim())
      return NextResponse.json({ error: "Incident description is required" }, { status: 400 });
    if (!data.evidenceType)
      return NextResponse.json({ error: "Please indicate whether you have any supporting evidence" }, { status: 400 });
    if (!data.declaration)
      return NextResponse.json({ error: "Please confirm the declaration before submitting" }, { status: 400 });

    let divisionName: string | null = null;
    let departmentName: string | null = null;
    let sectionName: string | null = null;

    if (data.division) {
      const division = await prisma.division.findUnique({
        where: { id: Number(data.division) },
      });
      divisionName = division?.name ?? null;
    }
    if (data.department) {
      const department = await prisma.department.findUnique({
        where: { id: Number(data.department) },
      });
      departmentName = department?.name ?? null;
    }
    if (data.section) {
      const section = await prisma.section.findUnique({
        where: { id: Number(data.section) },
      });
      sectionName = section?.name ?? null;
    }

    const report = await prisma.sexualHarassmentReport.create({
      data: {
        reporterName: data.reporterName,
        reporterContact: data.reporterContact,
        reporterEmail: data.reporterEmail || null,
        isStaff: data.isStaff ?? true,
        staffId: data.staffId || null,
        workLocation: data.workLocation || null,
        divisionName,
        departmentName,
        sectionName,
        reportAs: data.reportAs || null,
        perpetratorName: data.perpetratorName || null,
        victimName: data.victimName || null,
        incidentLocation: data.incidentLocation || null,
        incidentDateTime: data.incidentDateTime || null,
        description: data.description,
        witnessName: data.witnessName || null,
        evidenceType: data.evidenceType || null,
      },
    });

    if (file) {
      const uploadDir = path.join(process.cwd(), "storage/sensitive-uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      const arrayBuffer = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(arrayBuffer));

      await prisma.sexualHarassmentAttachment.create({
        data: {
          reportId: report.id,
          fileName,
          filePath: `storage/sensitive-uploads/${fileName}`,
          fileType: file.type || "unknown",
        },
      });
    }

    if (data.reporterEmail) {
      const confirmationMail = {
        from: emailFrom,
        to: data.reporterEmail,
        subject: "Your report has been received",
        template: "FormSubmission",
        context: {
          subject: "Your Report Has Been Received",
          recipientName: data.reporterName,
          formTitle: "Sexual Harassment Report",
          requestorName: data.reporterName,
          requestorStaffId: data.staffId || "N/A",
          department: departmentName || "N/A",
          submittedAt: new Date(report.createdAt).toLocaleString(),
          status: "Submitted",
          requestLink: webLink,
          isApprover: false,
          headerText: "Your Report Has Been Sent for Review",
          bodyText: "Your report has been submitted successfully and is now under review by our compliance team.",
        },
      };

      try {
        await transporter.sendMail(confirmationMail);
      } catch (mailErr) {
        console.error("Failed to send reporter confirmation email:", mailErr);
      }
    }

    const officerEmails = await getComplianceOfficerEmails();
    if (officerEmails.length > 0) {
      const [firstEmail, ...otherEmails] = officerEmails;
      const notificationMail = {
        from: emailFrom,
        to: firstEmail,
        cc: otherEmails,
        subject: "Action Required: New Sexual Harassment Report",
        template: "FormSubmission",
        context: {
          subject: "Action Required: New Sexual Harassment Report",
          recipientName: "Compliance Officer",
          formTitle: "Sexual Harassment Report",
          requestorName: data.reporterName,
          requestorStaffId: data.staffId || "N/A",
          department: departmentName || "N/A",
          submittedAt: new Date(report.createdAt).toLocaleString(),
          status: "Submitted",
          approvalLink: `${webLink}/dashboard/approval?shrid=${report.id}&name=Sexual+Harassment+Report`,
          isApprover: true,
          headerText: "Action Required: New Sexual Harassment Report Pending Review",
          bodyText: "A new sexual harassment report has been submitted and requires your review.",
          approverActionText: "You may review the report using the link below:",
          buttonText: "Review Report",
        },
      };

      try {
        await transporter.sendMail(notificationMail);
      } catch (mailErr) {
        console.error("Failed to send compliance officer notification email:", mailErr);
      }
    } else {
      console.error(
        'No compliance officers configured - create a "Sexual Harassment Report" form type with a manually-assigned approver in Admin > Approval Flow. Report was created without notification.',
      );
    }

    return NextResponse.json({ message: "Report submitted" }, { status: 200 });
  } catch (error) {
    console.error("Error creating sexual harassment report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
