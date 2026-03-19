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

  const baseInputStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "52px",
    padding: "14px 16px",
    fontSize: "16px",
    color: "#1B2B3A",
    backgroundColor: "#F4F5F8",
    border: "1.5px solid #CDD2DA",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
  };

  const errorInputStyle: React.CSSProperties = {
    ...baseInputStyle,
    border: "1.5px solid #E53E3E",
    backgroundColor: "#FFF5F5",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    color: "#3D4A5C",
    marginBottom: "7px",
    letterSpacing: "0.01em",
  };

  const errorMsgStyle: React.CSSProperties = {
    marginTop: "6px",
    fontSize: "13px",
    color: "#E53E3E",
    fontWeight: 500,
  };

  function handleFocus(e: React.FocusEvent<HTMLInputElement>, field: string) {
    if (!(touched[field] && errors[field as keyof FieldErrors])) {
      e.currentTarget.style.borderColor = accentColor;
      e.currentTarget.style.backgroundColor = "#FFFFFF";
      e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}18`;
    }
  }

  function handleFieldBlur(e: React.FocusEvent<HTMLInputElement>, field: string) {
    if (!(touched[field] && errors[field as keyof FieldErrors])) {
      e.currentTarget.style.borderColor = "#CDD2DA";
      e.currentTarget.style.backgroundColor = "#F4F5F8";
      e.currentTarget.style.boxShadow = "none";
    }
  }

  return (
    <div style={{ maxWidth: "540px", margin: "0 auto" }}>
      <h2
        className="font-display"
        style={{
          fontSize: "clamp(26px, 3.5vw, 32px)",
          fontWeight: 700,
          color: "#1B2B3A",
          marginBottom: "8px",
          lineHeight: 1.2,
        }}
      >
        Let&apos;s Get Started
      </h2>
      <p
        style={{
          fontSize: "16px",
          color: "#6B7580",
          marginBottom: "36px",
          lineHeight: 1.55,
        }}
      >
        Enter your information below so we can send your results.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          {/* Name row — side by side on desktop */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" as const }}>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <label htmlFor="firstName" style={labelStyle}>
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={(e) => { handleBlur("firstName"); handleFieldBlur(e, "firstName"); }}
                onFocus={(e) => handleFocus(e, "firstName")}
                placeholder="Jane"
                style={touched.firstName && errors.firstName ? errorInputStyle : baseInputStyle}
              />
              {touched.firstName && errors.firstName && (
                <p style={errorMsgStyle} aria-live="polite" role="alert">{errors.firstName}</p>
              )}
            </div>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <label htmlFor="lastName" style={labelStyle}>
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={(e) => { handleBlur("lastName"); handleFieldBlur(e, "lastName"); }}
                onFocus={(e) => handleFocus(e, "lastName")}
                placeholder="Smith"
                style={touched.lastName && errors.lastName ? errorInputStyle : baseInputStyle}
              />
              {touched.lastName && errors.lastName && (
                <p style={errorMsgStyle} aria-live="polite" role="alert">{errors.lastName}</p>
              )}
            </div>
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
              onBlur={(e) => { handleBlur("email"); handleFieldBlur(e, "email"); }}
              onFocus={(e) => handleFocus(e, "email")}
              placeholder="jane@example.com"
              style={touched.email && errors.email ? errorInputStyle : baseInputStyle}
            />
            {touched.email && errors.email && (
              <p style={errorMsgStyle} aria-live="polite" role="alert">{errors.email}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              minHeight: "54px",
              padding: "15px 32px",
              marginTop: "8px",
              fontSize: "17px",
              fontWeight: 700,
              color: "#FFFFFF",
              backgroundColor: accentColor,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              letterSpacing: "0.01em",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.14)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.1)";
            }}
          >
            Continue
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 9H14M14 9L9.5 4.5M14 9L9.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
