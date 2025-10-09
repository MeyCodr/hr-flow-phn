import { Button, Input } from '@headlessui/react';
import React, { useState } from 'react'

export default function LeaveRequest() {

     const [formData, setFormData] = useState({ startDate: "", endDate: "", reason: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Submitting Leave Request", formData);
    // call API here
  };
  return (
  <div>
      <h2>Leave Request Form</h2>
      
    </div>
  )
}
