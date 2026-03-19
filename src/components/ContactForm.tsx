"use client";

import { useState } from "react";
import { ContactInfo } from "@/lib/types";

interface ContactFormProps {
  onSubmit: (info: ContactInfo) => void;
  accentColor: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export default function ContactForm({ onSubmit, accentColor }: ContactFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";
    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!email.includes("@") || !email.includes(".")) {
      errs.email = "Please enter a valid email address.";
    }
    return errs;
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate();
    setErrors(errs);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ firstName: true, lastName: true, email: true });
    if (Object.keys(errs).length > 0) return;
    onSubmit({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "52px",
    padding: "14px 16px",
    fontSize: "17px",
    color: "#111827",
    backgroundColor: "#FFFFFF",
    border: "2px solid #E5E7EB",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
  };

  const inputErrorStyle: React.CSSProperties = {
    ...inputStyle,
    border: "2px solid #EF4444",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "15px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "8px",
  };

  const errorMsgStyle: React.CSSProperties = {
    marginTop: "6px",
    fontSize: "14px",
    color: "#EF4444",
  };

  return (
    <div
      style={{
        maxWidth: "520px",
        margin: "0 auto",
        padding: "48px 24px",
      }}
    >
      <h2
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "#111827",
          marginBottom: "8px",
          letterSpacing: "-0.3px",
        }}
      >
        Before we show your results
      </h2>
      <p
        style={{
          fontSize: "16px",
          color: "#6B7280",
          marginBottom: "36px",
          lineHeight: "1.55",
        }}
      >
        Enter your name and email so we can send you a personalized breakdown.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* First name */}
          <div>
            <label htmlFor="firstName" style={labelStyle}>
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleBlur("firstName")}
              placeholder="Jane"
              style={touched.firstName && errors.firstName ? inputErrorStyle : inputStyle}
              onFocus={(e) => {
                if (!(touched.firstName && errors.firstName)) {
                  (e.currentTarget as HTMLInputElement).style.borderColor = accentColor;
                }
              }}
              onBlurCapture={(e) => {
                if (!(touched.firstName && errors.firstName)) {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "#E5E7EB";
                }
              }}
            />
            {touched.firstName && errors.firstName && (
              <p style={errorMsgStyle}>{errors.firstName}</p>
            )}
          </div>

          {/* Last name */}
          <div>
            <label htmlFor="lastName" style={labelStyle}>
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleBlur("lastName")}
              placeholder="Smith"
              style={touched.lastName && errors.lastName ? inputErrorStyle : inputStyle}
              onFocus={(e) => {
                if (!(touched.lastName && errors.lastName)) {
                  (e.currentTarget as HTMLInputElement).style.borderColor = accentColor;
                }
              }}
              onBlurCapture={(e) => {
                if (!(touched.lastName && errors.lastName)) {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "#E5E7EB";
                }
              }}
            />
            {touched.lastName && errors.lastName && (
              <p style={errorMsgStyle}>{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" style={labelStyle}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="jane@example.com"
              style={touched.email && errors.email ? inputErrorStyle : inputStyle}
              onFocus={(e) => {
                if (!(touched.email && errors.email)) {
                  (e.currentTarget as HTMLInputElement).style.borderColor = accentColor;
                }
              }}
              onBlurCapture={(e) => {
                if (!(touched.email && errors.email)) {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "#E5E7EB";
                }
              }}
            />
            {touched.email && errors.email && (
              <p style={errorMsgStyle}>{errors.email}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              display: "block",
              width: "100%",
              minHeight: "52px",
              padding: "14px 32px",
              marginTop: "8px",
              fontSize: "17px",
              fontWeight: 700,
              color: "#FFFFFF",
              backgroundColor: accentColor,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              letterSpacing: "0.2px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.13)",
              transition: "opacity 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
