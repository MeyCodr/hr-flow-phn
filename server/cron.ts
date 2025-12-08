require("dotenv").config();
const cron = require("node-cron");

const link = process.env.NEXTAUTH_URL;

if (!link) {
  console.error("❌ NEXTAUTH_URL is missing. Check your .env");
  process.exit(1);
}

cron.schedule("*/2 * * * *", async () => {
  try {
    const res = await fetch(`${link}/api/cron/escalate-overdue`);

    const data = await res.json();
    console.log("Cron job executed:", data);
  } catch (err) {
    console.error("Escalation cron error:", err);
  }
});
