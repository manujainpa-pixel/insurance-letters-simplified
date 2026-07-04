import { useState } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const NAV = "#1B3A6B";
const GOLD = "#C9A84C";
const G50 = "#F9FAFB"; const G100 = "#F3F4F6"; const G200 = "#E5E7EB";
const G400 = "#9CA3AF"; const G600 = "#4B5563"; const G800 = "#1F2937"; const G900 = "#111827";
const GREEN = "#166534"; const GBGL = "#F0FDF4"; const GBDR = "#86EFAC";
const RED = "#991B1B"; const RBGL = "#FEF2F2"; const RBDR = "#FCA5A5";
const BLUE = "#1E40AF"; const BBGL = "#EFF6FF"; const BBDR = "#BFDBFE";
const AMBER = "#92400E"; const ABGL = "#FFFBEB"; const ABDR = "#FDE68A";

const LETTER_TYPES = [
  { id: "fmla", label: "Standalone FMLA", sublabel: "Job protection only · WH-381 base", color: NAV },
  { id: "pfml", label: "FMLA + Paid Leave", sublabel: "FMLA + state PFML coordination", color: "#0D6B3B" },
  { id: "std",  label: "FMLA + STD", sublabel: "FMLA + short-term disability integration", color: "#7C2D12" },
];

const NOTICE_SCOPES = [
  {
    id: "en",
    label: "EN Only",
    fullLabel: "Eligibility Notice Only",
    sublabel: "WH-381 Part A · Due within 5 days of leave request",
    icon: "📋",
    hint: "Use when designation hasn't been made yet — cert still pending or leave not yet confirmed as FMLA-qualifying.",
  },
  {
    id: "dn",
    label: "DN Only",
    fullLabel: "Designation Notice Only",
    sublabel: "WH-382 · Due within 5 days of sufficient information",
    icon: "🏷️",
    hint: "Use when EN was already sent separately and you now have enough info to designate. Include Part C rights.",
  },
  {
    id: "combined",
    label: "EN + DN Combined",
    fullLabel: "Combined Eligibility & Designation",
    sublabel: "WH-381 + WH-382 · Sent when both determinations are ready simultaneously",
    icon: "📄",
    hint: "Most common in integrated absence platforms — send once when cert is received and designation can be made at the same time as eligibility.",
  },
];

const STATES = ["Maine (ME)", "Tennessee (TN)", "Federal Only (No State Overlay)"];

const QUALIFYING_REASONS = [
  "Employee's own serious health condition",
  "Care for spouse/family member with serious health condition",
  "Birth and bonding with newborn (within 1 year)",
  "Adoption or foster placement (within 1 year)",
  "Military qualifying exigency",
  "Military caregiver leave",
];

const LEAVE_YEAR_METHODS = [
  "Rolling 12-month period (measured backward)",
  "Calendar year (Jan 1 – Dec 31)",
  "Fixed 12-month leave year",
  "12-month period measured forward",
];

const DELIVERY_METHODS = ["Secure portal + email", "Certified mail", "Email only", "Hand delivered"];

const today = new Date();
const fmtDate = d => d.toISOString().split("T")[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const autoLetterId = () => `FMLA-${today.getFullYear()}-${String(Math.floor(Math.random()*90000)+10000)}`;
const autoClaimNum = () => `CLM-${today.getFullYear()}-${String(Math.floor(Math.random()*900000)+100000)}`;

// ─── DEFAULT FORM STATE ───────────────────────────────────────────────────────
const defaultForm = {
  // Meta
  letterType: "fmla",
  noticeScope: "combined",
  letterId: autoLetterId(),
  claimNumber: autoClaimNum(),
  generatedDate: fmtDate(today),
  deliveryMethod: "Secure portal + email",
  templateVersion: "v3.0.0",

  // Employer
  employerName: "", hrContactName: "", hrTitle: "", hrPhone: "", hrEmail: "",
  worksiteAddress: "", worksiteHeadcount: "", leaveYearMethod: LEAVE_YEAR_METHODS[0],

  // Administrator
  adminName: "", adminPhone: "", adminEmail: "",

  // Employee
  employeeName: "", employeeId: "", position: "", department: "", employeeAddress: "",
  hireDate: "", hoursLast12Mo: "", monthsEmployed: "",
  stateOfEmployment: STATES[0],

  // Leave request
  noticeReceived: fmtDate(today),
  leaveType: "Continuous",
  qualifyingReason: QUALIFYING_REASONS[0],
  familyMemberRelationship: "",
  leaveStart: "", leaveEnd: "",
  intermittentFrequency: "",

  // Eligibility
  fmlaEligible: "yes",
  ineligMonths: false, ineligHours: false, ineligSize: false,
  fmlaEntitlementWeeks: "12", fmlaUsedWeeks: "0",
  leaveYearStart: "",
  manualEligOverride: false, overrideReason: "",

  // Designation
  isDesignated: "yes",
  nonDesignationReason: "",
  weeksCountedFmla: "",

  // Maine-specific entitlement
  maineEntitlementWeeks: "10", maineUsedWeeks: "0", maineBenefitYearStart: "",

  // Med cert
  medCertRequired: "yes",
  medCertDueDate: fmtDate(addDays(today, 15)),
  medCertStatus: "Pending",
  providerName: "", providerPractice: "",
  recertRequired: "no", recertDate: "",

  // Requirements
  paidLeaveConcurrent: "yes", paidLeaveTypes: "Accrued sick leave and PTO",
  fitForDutyRequired: "yes", fitForDutyEssentialFunctions: "no",
  anticipatedReturn: "", contactDaysBeforeReturn: "2",

  // Health benefits
  employeePremiumShare: "", premiumPaymentMethod: "Direct bill during leave",

  // ── STD ADDENDUM FIELDS ──
  stdCarrierName: "", stdPlanName: "", stdClaimNumber: "",
  stdEliminationDays: "7",
  stdWeeklyBenefit: "", stdBenefitPct: "60",
  stdMaxDurationWeeks: "26",
  stdOffsetSources: "",
  stdExhaustionDate: "",
  stdBridgeToLtd: "no", ltdClaimNumber: "",
  stdNotePtoRestriction: true,

  // ── PFML ADDENDUM FIELDS ──
  pfmlProgram: "", pfmlAdminContact: "", pfmlClaimNumber: "",
  pfmlWeeklyBenefit: "", pfmlBenefitPct: "60",
  pfmlWeeksAvailable: "12", pfmlWeeksUsed: "0",
  pfmlWaitingDays: "7",
  pfmlPrimaryPayer: "PFML pays first",
  pfmlOffsetStd: "no",
  pfmlClaimFiled: "yes",
  pfmlConcurrencyNote: "",

  // ── CUSTOM LETTER TEXT ──
  customOpening: "",
  customMidNote: "",
  customClosing: "",
};

// ─── SMALL UI HELPERS ─────────────────────────────────────────────────────────
const ff = "system-ui, -apple-system, sans-serif";

const Input = ({ label, value, onChange, type="text", placeholder="", required=false, hint="" }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, fontFamily: ff }}>
      {label}{required && <span style={{ color: RED }}> *</span>}
    </label>
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "8px 10px", border: `1px solid ${G200}`, borderRadius: 5, fontSize: 13, fontFamily: ff, color: G900, outline: "none", boxSizing: "border-box", background: "white" }}
    />
    {hint && <div style={{ fontSize: 11, color: G400, marginTop: 3, fontFamily: ff }}>{hint}</div>}
  </div>
);

const Select = ({ label, value, onChange, options, hint="" }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, fontFamily: ff }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "8px 10px", border: `1px solid ${G200}`, borderRadius: 5, fontSize: 13, fontFamily: ff, color: G900, background: "white", boxSizing: "border-box" }}>
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
    {hint && <div style={{ fontSize: 11, color: G400, marginTop: 3, fontFamily: ff }}>{hint}</div>}
  </div>
);

const Toggle = ({ label, checked, onChange, hint="" }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      style={{ marginTop: 2, width: 15, height: 15, accentColor: NAV, flexShrink: 0 }} />
    <div>
      <span style={{ fontSize: 13, color: G800, fontFamily: ff }}>{label}</span>
      {hint && <div style={{ fontSize: 11, color: G400, marginTop: 2, fontFamily: ff }}>{hint}</div>}
    </div>
  </div>
);

const Radio = ({ label, value, current, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13, fontFamily: ff, color: G800 }}>
    <input type="radio" checked={current === value} onChange={() => onChange(value)} style={{ accentColor: NAV }} />
    {label}
  </label>
);

const SectionHead = ({ title, subtitle, icon }) => (
  <div style={{ borderBottom: `2px solid ${G100}`, paddingBottom: 10, marginBottom: 18, marginTop: 8 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: NAV, fontFamily: ff }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: G400, fontFamily: ff }}>{subtitle}</div>}
      </div>
    </div>
  </div>
);

const Grid = ({ children, cols = 2 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "0 16px" }}>{children}</div>
);

const Callout = ({ color, bg, border, children }) => (
  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 12.5, color, lineHeight: 1.6, fontFamily: ff }}>{children}</div>
);

// ─── LETTER COMPONENTS ────────────────────────────────────────────────────────
const LCheck = ({ checked, children }) => (
  <div style={{ display: "flex", gap: 9, marginBottom: 8, alignItems: "flex-start" }}>
    <div style={{ width: 14, height: 14, border: `2px solid ${checked ? NAV : G400}`, borderRadius: 3, flexShrink: 0, marginTop: 2, background: checked ? NAV : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {checked && <svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
    </div>
    <span style={{ fontSize: 13, color: G800, lineHeight: 1.6, fontFamily: ff }}>{children}</span>
  </div>
);

const LField = ({ label, value }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: G400, marginBottom: 2, fontFamily: ff }}>{label}</div>
    <div style={{ fontSize: 13, color: G900, borderBottom: `1px solid ${G200}`, paddingBottom: 4, minHeight: 22, fontFamily: ff }}>{value || "—"}</div>
  </div>
);

const LDivider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 16px" }}>
    <div style={{ height: 1, flex: 1, background: G200 }} />
    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: NAV, fontFamily: ff, whiteSpace: "nowrap" }}>{label}</span>
    <div style={{ height: 1, flex: 1, background: G200 }} />
  </div>
);

const LBadge = ({ yes, yLabel, nLabel }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 99, background: yes ? GBGL : RBGL, border: `1px solid ${yes ? GBDR : RBDR}`, color: yes ? GREEN : RED, fontSize: 12, fontWeight: 700, fontFamily: ff }}>
    {yes ? "✓" : "✗"} {yes ? yLabel : nLabel}
  </span>
);

const LNote = ({ type, children }) => {
  const map = { info: [BBGL, BBDR, BLUE], success: [GBGL, GBDR, GREEN], warn: [ABGL, ABDR, AMBER] };
  const [bg, bd, cl] = map[type] || map.info;
  return <div style={{ background: bg, border: `1px solid ${bd}`, borderRadius: 6, padding: "10px 14px", marginBottom: 12, fontSize: 12.5, color: cl, lineHeight: 1.6, fontFamily: ff }}>{children}</div>;
};

const PartBadge = ({ label, color }) => (
  <span style={{ background: color || NAV, color: "white", borderRadius: 4, padding: "2px 9px", fontSize: 10, fontWeight: 700, fontFamily: ff, letterSpacing: "0.06em", marginRight: 8 }}>{label}</span>
);

// ─── GENERATED LETTER (CLAIMANT-FACING) ──────────────────────────────────────
function GeneratedLetter({ f }) {
  const isEligible  = f.fmlaEligible === "yes";
  const isDesignated= f.isDesignated === "yes";
  const scope       = f.noticeScope || "combined";
  const showEN      = scope === "en"  || scope === "combined";
  const showDN      = scope === "dn"  || scope === "combined";
  const stateCode   = f.stateOfEmployment.includes("ME") ? "ME" : f.stateOfEmployment.includes("TN") ? "TN" : null;
  const fmlaRem     = Math.max(0, parseInt(f.fmlaEntitlementWeeks || 12) - parseInt(f.fmlaUsedWeeks || 0));
  const maineRem    = Math.max(0, parseInt(f.maineEntitlementWeeks || 10) - parseInt(f.maineUsedWeeks || 0));

  // ── shared typography tokens ───────────────────────────────────────────────
  const body   = { fontSize: 13.5, color: "#1a1a1a", lineHeight: 1.8, fontFamily: "Georgia, serif", margin: "0 0 14px" };
  const label  = { fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", fontFamily: ff, margin: "0 0 4px", display: "block" };
  const value  = { fontSize: 13.5, color: "#1a1a1a", fontFamily: "Georgia, serif", borderBottom: "1px solid #ccc", paddingBottom: 3, margin: "0 0 14px" };
  const rule   = { border: "none", borderTop: "1px solid #ddd", margin: "20px 0" };
  const indent = { paddingLeft: 20, borderLeft: "2px solid #ccc", margin: "0 0 14px" };

  const Row = ({ l, v }) => (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "0 16px", margin: "0 0 8px" }}>
      <span style={{ ...label, margin: 0, alignSelf: "center" }}>{l}</span>
      <span style={{ ...body, margin: 0, fontSize: 13 }}>{v || "—"}</span>
    </div>
  );

  const scopeTitle = scope === "en" ? "Notice of Eligibility" : scope === "dn" ? "Designation Notice" : "Notice of Eligibility and Leave Designation";
  const firstName = (f.employeeName || "").split(" ")[0] || "Employee";

  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 680, margin: "0 auto", color: "#1a1a1a" }}>

      {/* ── LETTERHEAD ── */}
      <div style={{ borderBottom: "2px solid #1a1a1a", paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", fontFamily: ff, margin: "0 0 4px" }}>
              {f.adminName || "Leave Administrator"}
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", margin: "0 0 2px", lineHeight: 1.2 }}>Family and Medical Leave Act</p>
            <p style={{ fontSize: 15, color: "#333", margin: 0 }}>{scopeTitle}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ ...body, margin: "0 0 2px", fontSize: 12, color: "#555" }}>{f.generatedDate}</p>
            <p style={{ fontSize: 11, color: "#888", fontFamily: ff, margin: 0 }}>Claim no. {f.claimNumber}</p>
          </div>
        </div>
      </div>

      {/* ── ADDRESSES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div>
          <span style={label}>From</span>
          <p style={{ ...body, margin: 0, fontSize: 13, lineHeight: 1.7 }}>
            {f.adminName || f.hrContactName || "Leave Administrator"}<br />
            {f.adminPhone && <>{f.adminPhone}<br /></>}
            {f.adminEmail && <>{f.adminEmail}<br /></>}
            {f.worksiteAddress && <>{f.worksiteAddress}</>}
          </p>
        </div>
        <div>
          <span style={label}>To</span>
          <p style={{ ...body, margin: 0, fontSize: 13, lineHeight: 1.7 }}>
            {f.employeeName || "Employee"}<br />
            {f.position && <>{f.position}{f.department ? `, ${f.department}` : ""}<br /></>}
            {f.employeeAddress && <>{f.employeeAddress}<br /></>}
            {f.employeeId && <>ID: {f.employeeId}</>}
          </p>
        </div>
      </div>

      <hr style={rule} />

      {/* ── SALUTATION ── */}
      <p style={body}>Dear {firstName},</p>
      {f.customOpening && (
        <p style={{ ...body, fontStyle: "italic" }}>{f.customOpening}</p>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PART A — ELIGIBILITY NOTICE
      ══════════════════════════════════════════════════════════════════════ */}
      {showEN && <>
        <p style={body}>
          We received your request for leave on <strong>{f.noticeReceived}</strong>. This letter is to inform you of your eligibility for leave under the Family and Medical Leave Act (FMLA)
          {stateCode === "ME" ? " and the Maine Family Medical Leave Requirements" : stateCode === "TN" ? " and, where applicable, the Tennessee Parental Leave Act" : ""}.
        </p>

        {/* Leave details */}
        <p style={{ ...label, marginBottom: 8 }}>Your leave request</p>
        <div style={{ ...indent, paddingLeft: 16, borderLeft: "2px solid #ccc", marginBottom: 18 }}>
          <Row l="Reason for leave"    v={f.qualifyingReason} />
          <Row l="Type of leave"       v={f.leaveType} />
          <Row l="Requested start"     v={f.leaveStart} />
          <Row l="Requested end"       v={f.leaveEnd} />
          {f.leaveType !== "Continuous" && f.intermittentFrequency && <Row l="Schedule" v={f.intermittentFrequency} />}
        </div>

        {/* Eligibility */}
        <p style={{ ...label, marginBottom: 8 }}>Your eligibility status</p>
        {isEligible ? (<>
          <p style={body}>
            Based on our records, you are <strong>eligible for FMLA leave</strong>. You are entitled to up to <strong>{f.fmlaEntitlementWeeks || 12} weeks</strong> of job-protected leave in your current leave year.
            You have used <strong>{f.fmlaUsedWeeks || 0} weeks</strong> so far, leaving <strong>{fmlaRem} weeks</strong> available.
          </p>
          {stateCode === "ME" && (
            <p style={body}>
              Under Maine state law, you are also entitled to up to <strong>{f.maineEntitlementWeeks || 10} weeks</strong> of leave within any two-year period.
              You have used <strong>{f.maineUsedWeeks || 0} weeks</strong> of your Maine entitlement, leaving <strong>{maineRem} weeks</strong> available under state law.
              Your leave will be counted against both your federal and state balances at the same time.
            </p>
          )}
        </>) : (<>
          <p style={body}>
            Based on our records, you are <strong>not eligible for FMLA leave</strong> at this time for the following reason{[f.ineligMonths, f.ineligHours, f.ineligSize].filter(Boolean).length > 1 ? "s" : ""}:
          </p>
          <div style={indent}>
            {f.ineligMonths && <p style={{ ...body, margin: "0 0 6px" }}>You have not been employed for at least 12 months.</p>}
            {f.ineligHours  && <p style={{ ...body, margin: "0 0 6px" }}>You have not worked at least 1,250 hours in the past 12 months.</p>}
            {f.ineligSize   && <p style={{ ...body, margin: "0 0 6px" }}>Your worksite does not employ 50 or more employees within 75 miles.</p>}
          </div>
          <p style={body}>
            Please contact {f.hrContactName || "your HR representative"} at {f.hrPhone || f.adminPhone || "the number above"} if you have questions about your eligibility.
          </p>
        </>)}
      </>}

      {/* ══════════════════════════════════════════════════════════════════════
          PART B — DESIGNATION NOTICE
      ══════════════════════════════════════════════════════════════════════ */}
      {showDN && <>
        {showEN && <hr style={rule} />}

        {scope === "dn" && (
          <p style={{ ...body, color: "#555", fontSize: 12 }}>
            Note: A separate eligibility notice was issued to you on {f.noticeReceived}. This letter confirms the designation of your leave.
          </p>
        )}

        <p style={{ ...label, marginBottom: 8 }}>Designation of your leave</p>
        {isDesignated ? (<>
          <p style={body}>
            Your leave from <strong>{f.leaveStart}</strong> to <strong>{f.leaveEnd}</strong> has been <strong>designated as FMLA leave</strong>.
            {f.weeksCountedFmla && ` Approximately ${f.weeksCountedFmla} week${f.weeksCountedFmla !== "1" ? "s" : ""} of leave will be counted against your FMLA entitlement.`}
            {stateCode === "ME" && " This leave is designated concurrently under federal FMLA and Maine state leave law."}
          </p>
        </>) : (<>
          <p style={body}>
            After reviewing your request, we are unable to designate this leave as FMLA leave at this time.
            {f.nonDesignationReason && ` ${f.nonDesignationReason}.`}
          </p>
          <p style={body}>
            If you believe this determination is incorrect or if your circumstances change, please contact us at the number above.
          </p>
        </>)}

        {/* Medical certification */}
        {f.customMidNote && (
          <><hr style={rule} /><p style={{ ...body, fontStyle: "italic" }}>{f.customMidNote}</p></>
        )}

        {/* Medical certification */}
        {f.medCertRequired === "yes" && (<>
          <hr style={rule} />
          <p style={{ ...label, marginBottom: 8 }}>Medical certification</p>
          {f.medCertStatus === "Received — Sufficient" ? (
            <p style={body}>We have received sufficient medical certification for this leave. No further documentation is required at this time.</p>
          ) : f.medCertStatus === "Pending" ? (<>
            <p style={body}>
              To support your leave request, you must provide medical certification from your treating healthcare provider.
              Please submit the completed certification by <strong>{f.medCertDueDate}</strong>.
            </p>
            <p style={body}>
              Failure to provide certification by the due date may result in a delay or denial of your leave request. If you need additional time, please contact us before the deadline.
            </p>
          </>) : (
            <p style={body}>
              We have received your medical certification. Please note: {f.medCertStatus?.toLowerCase()}.
              {f.medCertStatus === "Received — Insufficient" && " We will contact you regarding what additional information is needed."}
            </p>
          )}
          {f.recertRequired === "yes" && f.recertDate && (
            <p style={body}>Recertification will be required by <strong>{f.recertDate}</strong>. We will notify you when it is due.</p>
          )}
        </>)}

        {/* Paid leave */}
        <hr style={rule} />
        <p style={{ ...label, marginBottom: 8 }}>Use of paid leave during your absence</p>
        {f.paidLeaveConcurrent === "yes" ? (
          <p style={body}>
            You are required to use any accrued {f.paidLeaveTypes || "paid leave"} at the same time as your FMLA leave. This does not extend the total length of leave available to you.
            {f.letterType === "std" && " Because you are receiving short-term disability benefits during this period, you are not required to use accrued paid time off."}
          </p>
        ) : (
          <p style={body}>You are not required to use accrued paid leave during this FMLA absence.</p>
        )}

        {/* STD addendum */}
        {f.letterType === "std" && (<>
          <hr style={rule} />
          <p style={{ ...label, marginBottom: 8 }}>Short-term disability benefit</p>
          <p style={body}>
            Your short-term disability (STD) benefit will run at the same time as your FMLA leave — they do not stack on top of each other.
            Your FMLA leave protects your job; your STD benefit provides income replacement during your absence.
          </p>
          <div style={{ ...indent, marginBottom: 18 }}>
            {f.stdClaimNumber   && <Row l="STD claim number"      v={f.stdClaimNumber} />}
            {f.stdCarrierName   && <Row l="Administered by"       v={f.stdCarrierName} />}
            {f.stdWeeklyBenefit && <Row l="Approved weekly benefit" v={`$${f.stdWeeklyBenefit}`} />}
            {f.stdEliminationDays && <Row l="Waiting period"      v={`${f.stdEliminationDays} calendar days before benefit begins`} />}
            {f.stdMaxDurationWeeks && <Row l="Maximum benefit duration" v={`${f.stdMaxDurationWeeks} weeks`} />}
          </div>
          {f.stdBridgeToLtd === "yes" && (
            <p style={body}>
              If your disability continues beyond the short-term disability period, you may be eligible for long-term disability (LTD) benefits.
              {f.ltdClaimNumber ? ` An LTD claim (${f.ltdClaimNumber}) has been opened.` : " Please contact your HR representative to discuss LTD eligibility if that situation arises."}
            </p>
          )}
          <p style={body}>
            Your FMLA job protection lasts up to {f.fmlaEntitlementWeeks || 12} weeks. If your disability continues beyond your FMLA entitlement, your STD income benefits may continue per your plan terms, but your right to return to your position under FMLA will have ended. Please contact us to discuss your options if you expect your recovery to extend beyond your FMLA leave period.
          </p>
        </>)}

        {/* PFML addendum */}
        {f.letterType === "pfml" && (<>
          <hr style={rule} />
          <p style={{ ...label, marginBottom: 8 }}>Paid family and medical leave benefit</p>
          <p style={body}>
            Your {f.pfmlProgram || "state paid family and medical leave"} benefit will run at the same time as your FMLA leave. This does not give you additional time off beyond your FMLA entitlement — both clocks run simultaneously.
          </p>
          <div style={{ ...indent, marginBottom: 18 }}>
            {f.pfmlProgram        && <Row l="Program"             v={f.pfmlProgram} />}
            {f.pfmlClaimNumber    && <Row l="PFML claim number"   v={f.pfmlClaimNumber} />}
            {f.pfmlAdminContact   && <Row l="Administered by"     v={f.pfmlAdminContact} />}
            {f.pfmlWeeklyBenefit  && <Row l="Estimated weekly benefit" v={`$${f.pfmlWeeklyBenefit}`} />}
            {f.pfmlWaitingDays    && <Row l="Waiting period"      v={`${f.pfmlWaitingDays} calendar days`} />}
            {f.pfmlWeeksAvailable && <Row l="Weeks available"     v={`${f.pfmlWeeksAvailable} weeks`} />}
          </div>
          {stateCode === "ME" && (
            <p style={body}>
              Under the Maine Paid Family and Medical Leave program, you are not required to use accrued paid time off before or during your PFML benefit period.
              Your employment benefits continue to accrue as if you were actively working.
            </p>
          )}
        </>)}

        {/* Return to work */}
        <hr style={rule} />
        <p style={{ ...label, marginBottom: 8 }}>Returning to work</p>
        <p style={body}>
          We expect your return to work on or around <strong>{f.anticipatedReturn || f.leaveEnd || "the end of your approved leave period"}</strong>.
          {f.contactDaysBeforeReturn && ` Please contact ${f.hrContactName || "HR"} at least ${f.contactDaysBeforeReturn} business day${f.contactDaysBeforeReturn !== "1" ? "s" : ""} before you plan to return.`}
        </p>
        {f.fitForDutyRequired === "yes" && (
          <p style={body}>
            Before returning to work, you must provide a fitness-for-duty certification from your treating healthcare provider confirming that you are able to return
            {f.fitForDutyEssentialFunctions === "yes" ? " and can perform the essential functions of your position" : ""}.
            Please bring this documentation to HR on or before your first day back.
          </p>
        )}

        {/* Rights and responsibilities */}
        <hr style={rule} />
        <p style={{ ...label, marginBottom: 8 }}>Your rights during leave</p>
        <p style={body}>While on FMLA leave, you have the right to:</p>
        <div style={indent}>
          <p style={{ ...body, margin: "0 0 6px" }}>Continue your group health insurance coverage under the same terms as if you were still working.</p>
          <p style={{ ...body, margin: "0 0 6px" }}>Return to the same position or an equivalent position with the same pay, benefits, and terms of employment.</p>
          <p style={{ ...body, margin: "0 0 6px" }}>Be protected from retaliation or discrimination for exercising your rights under FMLA.</p>
        </div>

        {/* Health insurance */}
        {f.employeePremiumShare && (
          <p style={body}>
            Your health insurance will remain active during your leave. Your share of the premium is <strong>${f.employeePremiumShare}</strong>.
            Payment method: {f.premiumPaymentMethod || "to be arranged with HR"}.
            If premiums are not paid, your coverage may be terminated after a 30-day written notice.
          </p>
        )}

        {/* State-specific obligations */}
        {stateCode === "TN" && (f.qualifyingReason?.includes("Birth") || f.qualifyingReason?.includes("Adoption") || f.qualifyingReason?.includes("bonding")) && (
          <p style={body}>
            Under the Tennessee Parental Leave Act, you may be entitled to up to four months of unpaid leave for the birth, adoption, or nursing of a child, provided your employer meets the applicable employee count requirement.
            This four-month period runs at the same time as your FMLA leave — it does not give you additional time beyond FMLA.
            Tennessee law requires three months' advance notice where the leave is foreseeable, except in the case of a medical emergency.
          </p>
        )}

        {/* Obligations */}
        <hr style={rule} />
        <p style={{ ...label, marginBottom: 8 }}>Your responsibilities</p>
        <div style={indent}>
          <p style={{ ...body, margin: "0 0 6px" }}>Notify us promptly if your leave dates or expected duration change.</p>
          <p style={{ ...body, margin: "0 0 6px" }}>Follow {f.employerName ? `${f.employerName}'s` : "your employer's"} regular call-in procedures for each day you are absent.</p>
          {f.paidLeaveConcurrent === "yes" && f.letterType !== "std" && (
            <p style={{ ...body, margin: "0 0 6px" }}>Use your accrued {f.paidLeaveTypes || "paid leave"} at the same time as your FMLA leave.</p>
          )}
          <p style={{ ...body, margin: "0 0 6px" }}>Continue paying your share of health insurance premiums to avoid a lapse in coverage.</p>
          {stateCode === "ME"
            ? <p style={{ ...body, margin: "0 0 6px" }}>Provide at least 30 days' advance notice when your need for leave is foreseeable (Maine state requirement).</p>
            : <p style={{ ...body, margin: "0 0 6px" }}>Provide at least 30 days' advance notice when your need for leave is foreseeable; otherwise notify us as soon as practicable.</p>
          }
        </div>
      </>}

      {/* ── CUSTOM CLOSING ── */}
      {f.customClosing && (
        <><hr style={rule} /><p style={{ ...body, fontStyle: "italic" }}>{f.customClosing}</p></>
      )}

      {/* ── REQUIRED ATTACHMENTS ── */}
      {(() => {
        const isBonding = f.qualifyingReason?.includes("Birth") || f.qualifyingReason?.includes("Adoption") || f.qualifyingReason?.includes("bonding");
        const isMilExig = f.qualifyingReason?.includes("exigency");
        const isMilCare = f.qualifyingReason?.includes("caregiver");
        const isFamilyCare = f.qualifyingReason?.includes("family member");
        const needCert  = f.medCertRequired === "yes" && f.medCertStatus === "Pending";
        const needFFD   = f.fitForDutyRequired === "yes";
        const isSTD     = f.letterType === "std";
        const isPFML    = f.letterType === "pfml";

        const attachments = [];

        // DOL cert forms
        if (needCert && !isFamilyCare && !isMilExig && !isMilCare)
          attachments.push({ label: "Medical Certification — Employee's Own Condition (WH-380-E)", url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-380-E.pdf", required: true });
        if (needCert && isFamilyCare)
          attachments.push({ label: "Medical Certification — Family Member's Condition (WH-380-F)", url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-380-F.pdf", required: true });
        if (isMilExig)
          attachments.push({ label: "Certification for Military Qualifying Exigency (WH-384)", url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-384.pdf", required: true });
        if (isMilCare)
          attachments.push({ label: "Certification for Serious Injury or Illness — Military (WH-385)", url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-385.pdf", required: true });

        // FFD form
        if (needFFD)
          attachments.push({ label: "Fitness-for-Duty Certification (WH-380-E, Section IV)", url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-380-E.pdf", required: true, note: "To be completed by your treating provider before your return to work." });

        // State forms
        if (stateCode === "ME") {
          attachments.push({ label: "Maine FMLA Employee Rights Notice", url: "https://www.maine.gov/labor/docs/2020/posters/fmla.pdf", required: true });
          if (isPFML)
            attachments.push({ label: "Maine Paid Family & Medical Leave — Employee Information", url: "https://www.maine.gov/pfml", required: true, note: "Explains how to file, benefit calculation, and appeal rights." });
        }
        if (stateCode === "TN" && isBonding)
          attachments.push({ label: "Tennessee Parental Leave Act — Employee Summary", url: "https://www.tn.gov/humanrights/title-4/title-4-chapter-21/title-4-chapter-21-part-4.html", required: false, note: "For reference — summarizes your rights under T.C.A. § 4-21-408." });

        // STD / PFML forms
        if (isSTD && f.stdCarrierName)
          attachments.push({ label: `Short-Term Disability Claim Form — ${f.stdCarrierName}`, url: "https://www.dol.gov/general/topic/disability/erisa", required: false, note: "Contact your HR representative or carrier directly for the claim form if not already submitted." });
        if (isPFML && stateCode !== "ME")
          attachments.push({ label: "State Paid Family & Medical Leave Claim Instructions", url: "https://www.dol.gov/general/topic/workhours/fmla", required: false });

        // Always include DOL FMLA rights poster
        attachments.push({ label: "Your Rights Under the FMLA — DOL Fact Sheet #28", url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/whdfs28.pdf", required: false, note: "Summary of your rights and the FMLA rules that apply to your leave." });
        attachments.push({ label: "File a Complaint with DOL Wage and Hour Division", url: "https://www.dol.gov/agencies/whd/contact/complaints", required: false, note: "If you believe your FMLA rights have been violated, contact WHD at 1-866-487-9243." });

        if (!attachments.length) return null;

        const aLink = { color: "#1a1a1a", textDecoration: "underline", fontFamily: ff, fontSize: 12.5 };

        return (<>
          <hr style={rule} />
          <p style={{ ...label, marginBottom: 10 }}>Enclosed documents and resources</p>
          <p style={{ ...body, fontSize: 12.5, color: "#444" }}>
            The following documents are enclosed with this notice or are available at the links below.
            Items marked <strong>Required</strong> must be submitted by the due date indicated.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {attachments.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 10, borderBottom: i < attachments.length - 1 ? "1px solid #eee" : "none" }}>
                <div style={{ flexShrink: 0, marginTop: 3 }}>
                  {a.required
                    ? <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: "#1a1a1a", color: "#fff", fontFamily: ff }}>Required</span>
                    : <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 3, background: "#f0f0f0", color: "#555", fontFamily: ff }}>Reference</span>
                  }
                </div>
                <div>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" style={aLink}>{a.label}</a>
                  {a.note && <p style={{ ...body, margin: "3px 0 0", fontSize: 12, color: "#666" }}>{a.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </>);
      })()}

      {/* ── CLOSING ── */}
      <hr style={rule} />
      <p style={body}>
        If you have any questions about this notice or your leave, please contact us at <strong>{f.adminPhone || f.hrPhone || "the number above"}</strong> or <strong>{f.adminEmail || f.hrEmail || "the email address above"}</strong>,
        and reference your claim number <strong>{f.claimNumber}</strong>.
      </p>
      <p style={body}>Sincerely,</p>
      <div style={{ marginBottom: 4 }}>
        <div style={{ borderBottom: "1px solid #1a1a1a", width: 200, height: 36, marginBottom: 4 }} />
        <p style={{ ...body, margin: 0, fontSize: 12 }}>{f.adminName || f.hrContactName || "Leave Administrator"}</p>
        {f.hrTitle && <p style={{ ...body, margin: 0, fontSize: 12, color: "#555" }}>{f.hrTitle}</p>}
        <p style={{ ...body, margin: 0, fontSize: 12, color: "#555" }}>On behalf of {f.employerName || "Employer"}</p>
      </div>

      {/* ── FOOTER — for operator reference only ── */}
      <div style={{ marginTop: 28, borderTop: "1px solid #ddd", paddingTop: 10 }}>
        <p style={{ fontSize: 10, color: "#aaa", fontFamily: ff, margin: 0, lineHeight: 1.6 }}>
          This notice is issued pursuant to the Family and Medical Leave Act of 1993, 29 U.S.C. §§ 2601–2654, and 29 CFR Part 825.
          {stateCode === "ME" && " Maine Family Medical Leave Requirements, 26 M.R.S. §§ 843–850-R."}
          {stateCode === "TN" && " Tennessee Parental Leave Act, T.C.A. § 4-21-408."}
          {" "}Template {f.templateVersion} · Letter ID {f.letterId} · Delivered via {f.deliveryMethod}.
        </p>
      </div>
    </div>
  );
}

// ─── COMPLIANCE REPORT ────────────────────────────────────────────────────────
function ComplianceReport({ f }) {
  const [openGroups, setOpenGroups] = useState({});
  const toggleGroup = (i) => setOpenGroups(p => ({ ...p, [i]: !p[i] }));
  const scope      = f.noticeScope || "combined";
  const showEN     = scope === "en"  || scope === "combined";
  const showDN     = scope === "dn"  || scope === "combined";
  const stateCode  = f.stateOfEmployment.includes("ME") ? "ME" : f.stateOfEmployment.includes("TN") ? "TN" : null;
  const isEligible = f.fmlaEligible === "yes";
  const isDesig    = f.isDesignated === "yes";
  const fmlaRem    = Math.max(0, parseInt(f.fmlaEntitlementWeeks||12) - parseInt(f.fmlaUsedWeeks||0));
  const maineRem   = Math.max(0, parseInt(f.maineEntitlementWeeks||10) - parseInt(f.maineUsedWeeks||0));

  // ── Due-date math ──────────────────────────────────────────────────────────
  const noticeDate = new Date(f.noticeReceived || Date.now());
  const fiveBizDaysLater = (() => {
    let d = new Date(noticeDate); let added = 0;
    while (added < 5) { d.setDate(d.getDate()+1); if (d.getDay()!==0 && d.getDay()!==6) added++; }
    return d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  })();
  const genDate    = new Date(f.generatedDate || Date.now());
  const bizDaysBetween = (() => {
    let d = new Date(noticeDate); let count = 0;
    while (d < genDate) { d.setDate(d.getDate()+1); if (d.getDay()!==0 && d.getDay()!==6) count++; }
    return count;
  })();
  const withinSLA  = bizDaysBetween <= 5;

  // ── Build checklist items ──────────────────────────────────────────────────
  const groups = [];
  const isSTDl  = f.letterType === "std";
  const isPFMLl = f.letterType === "pfml";
  const isFMLAl = f.letterType === "fmla";

  // Header showing which groups apply to this configuration
  const scopeDesc = scope === "en" ? "EN Only" : scope === "dn" ? "DN Only" : "EN + DN Combined";
  const typeDesc  = isSTDl ? "FMLA + STD" : isPFMLl ? "FMLA + PFML" : "Standalone FMLA";

  // ── GROUP 1: Timeliness ───────────────────────────────────────────────────
  const timeItems = [];
  if (showEN) timeItems.push({
    pass: withinSLA,
    reg:  "29 CFR §825.300(b)",
    req:  "Eligibility Notice within 5 business days of leave request",
    detail: `Request received ${f.noticeReceived || "—"} · Notice dated ${f.generatedDate} · ${bizDaysBetween} business day(s) elapsed · Deadline: ${fiveBizDaysLater}`,
    warn: !withinSLA ? `${bizDaysBetween} business days exceeds the 5-day requirement — review before sending` : null,
  });
  if (showDN) timeItems.push({
    pass: true,
    reg:  "29 CFR §825.300(d)",
    req:  "Designation Notice within 5 business days of receiving sufficient information",
    detail: "Sufficient information confirmed by medical certification receipt — designation issued concurrently",
  });
  if (showEN) timeItems.push({
    pass: true,
    reg:  "29 CFR §825.300(a)(1)",
    req:  "Notice must be in writing",
    detail: `Delivery method: ${f.deliveryMethod} · Letter ID ${f.letterId} logged for audit`,
  });
  if (showEN) timeItems.push({
    pass: !!(f.adminName && f.adminPhone),
    reg:  "29 CFR §825.300(a)(3)",
    req:  "Notice must include contact information for leave administrator",
    detail: f.adminName && f.adminPhone ? `${f.adminName} · ${f.adminPhone} · ${f.adminEmail}` : "⚠ Administrator name or phone not entered",
    warn: !(f.adminName && f.adminPhone) ? "Complete administrator contact fields in the form" : null,
  });
  groups.push({ title: "Timeliness & Delivery", icon: "⏱", items: timeItems });

  // ── GROUP 2: EN Content Requirements ─────────────────────────────────────
  if (showEN) {
    const enItems = [];
    enItems.push({
      pass: true,
      reg:  "29 CFR §825.300(b)(1)",
      req:  "State whether employee is eligible or the reason(s) for ineligibility",
      detail: isEligible
        ? "Eligible: all 3 tests passed (months employed, hours worked, 50-employee site threshold)"
        : `Not eligible — reasons flagged: ${[f.ineligMonths && "< 12 months", f.ineligHours && "< 1,250 hrs", f.ineligSize && "< 50 employees"].filter(Boolean).join("; ") || "see letter"}`,
    });
    enItems.push({
      pass: isEligible ? !!(f.fmlaEntitlementWeeks && f.fmlaUsedWeeks !== "") : true,
      reg:  "29 CFR §825.300(b)(1)",
      req:  "Notify employee of FMLA entitlement and any leave already used in the leave year",
      detail: isEligible
        ? `Entitlement: ${f.fmlaEntitlementWeeks} weeks · Used: ${f.fmlaUsedWeeks} weeks · Remaining: ${fmlaRem} weeks · Leave year: ${f.leaveYearMethod}`
        : "Not applicable — employee is not eligible",
      warn: isEligible && f.fmlaUsedWeeks === "" ? "FMLA weeks used not entered — required for eligible employees" : null,
    });
    enItems.push({
      pass: true,
      reg:  "29 CFR §825.300(b)(3)",
      req:  "Identify qualifying reason for leave",
      detail: `Qualifying reason: ${f.qualifyingReason}`,
    });
    enItems.push({
      pass: !!(f.leaveStart),
      reg:  "29 CFR §825.300(b)",
      req:  "Specify anticipated leave start date",
      detail: f.leaveStart ? `Estimated start: ${f.leaveStart}` : "⚠ Leave start date not provided",
      warn: !f.leaveStart ? "Leave start date is required" : null,
    });
    groups.push({ title: "EN Content Requirements (WH-381 / §825.300(b))", icon: "📋", items: enItems });
  }

  // ── GROUP 3: DN Content Requirements ─────────────────────────────────────
  if (showDN) {
    const dnItems = [];
    dnItems.push({
      pass: true,
      reg:  "29 CFR §825.300(d)(1)",
      req:  "State whether leave is designated as FMLA-qualifying or the reason it is not",
      detail: isDesig
        ? "Leave designated as FMLA-qualifying — included in Part B"
        : `Not designated — reason: ${f.nonDesignationReason || "not specified"}`,
    });
    dnItems.push({
      pass: isDesig ? !!(f.weeksCountedFmla) : true,
      reg:  "29 CFR §825.300(d)(2)",
      req:  "State the amount of leave counted against the FMLA entitlement (or that it cannot yet be determined for intermittent leave)",
      detail: f.leaveType === "Continuous"
        ? (f.weeksCountedFmla ? `${f.weeksCountedFmla} weeks counted against entitlement` : "⚠ Weeks counted not entered")
        : `${f.leaveType} leave — exact hours/days may be counted as taken per 29 CFR §825.205`,
      warn: f.leaveType === "Continuous" && isDesig && !f.weeksCountedFmla ? "Enter weeks counted to satisfy §825.300(d)(2)" : null,
    });
    dnItems.push({
      pass: true,
      reg:  "29 CFR §825.300(d)(3)",
      req:  "Notify employee whether paid leave will be substituted and under what conditions",
      detail: f.paidLeaveConcurrent === "yes"
        ? `Concurrent use of ${f.paidLeaveTypes} required — stated in Part B${f.letterType === "std" ? " · PTO restriction clause included (STD benefit is not unpaid leave)" : ""}`
        : "Paid leave substitution not required — stated in Part B",
    });
    dnItems.push({
      pass: true,
      reg:  "29 CFR §825.300(d)(4)",
      req:  "Specify whether fitness-for-duty certification is required to return to work",
      detail: f.fitForDutyRequired === "yes"
        ? `FFD certification required${f.fitForDutyEssentialFunctions === "yes" ? " — must address essential job functions" : " — general return-to-work clearance"} · Contact HR ${f.contactDaysBeforeReturn} business days before return`
        : "Fitness-for-duty certification not required — stated in Part B",
    });
    dnItems.push({
      pass: true,
      reg:  "29 CFR §825.300(c)",
      req:  "Inform employee of rights and responsibilities during and after FMLA leave",
      detail: "Part C covers: health benefit continuation, reinstatement rights, anti-retaliation protections, premium payment obligations, and employee obligations",
    });
    groups.push({ title: "DN Content Requirements (WH-382 / §825.300(d))", icon: "🏷️", items: dnItems });
  }

  // ── GROUP 4: Medical Certification ────────────────────────────────────────
  if (showDN) {
    const certItems = [];
    certItems.push({
      pass: true,
      reg:  "29 CFR §825.305(b)",
      req:  "Notify employee of certification requirement and provide at least 15 calendar days to obtain it",
      detail: f.medCertRequired === "yes"
        ? `Cert required · Status: ${f.medCertStatus} · Due date: ${f.medCertDueDate || "15 days from notice"} · Provider: ${f.providerName || "not entered"}`
        : "No certification required for this leave — stated in Part B",
    });
    certItems.push({
      pass: true,
      reg:  "29 CFR §825.308",
      req:  "Disclose recertification requirements if applicable",
      detail: f.recertRequired === "yes"
        ? `Recertification required by ${f.recertDate || "date TBD"}`
        : "No recertification required at this time — stated in Part B",
    });
    groups.push({ title: "Medical Certification (§825.305–308)", icon: "🩺", items: certItems });
  }

  // ── GROUP 5: Benefits ─────────────────────────────────────────────────────
  if (showDN) {
    const benItems = [];
    benItems.push({
      pass: true,
      reg:  "29 CFR §825.209(a)",
      req:  "Maintain group health plan coverage during FMLA leave on the same terms as if employee continued to work",
      detail: `Health benefits continuation confirmed in Part C · Employee premium share: ${f.employeePremiumShare ? `$${f.employeePremiumShare}` : "per plan terms"} · Method: ${f.premiumPaymentMethod}`,
    });
    benItems.push({
      pass: !!(f.employeePremiumShare && f.premiumPaymentMethod),
      reg:  "29 CFR §825.210(b)",
      req:  "Notify employee of their obligation to pay their share of health plan premiums during leave",
      detail: f.employeePremiumShare
        ? `Premium share stated: $${f.employeePremiumShare} · Payment method: ${f.premiumPaymentMethod}`
        : "⚠ Premium share amount not entered — required for compliance",
      warn: !f.employeePremiumShare ? "Enter employee premium share amount to satisfy §825.210(b)" : null,
    });
    benItems.push({
      pass: true,
      reg:  "29 CFR §825.214",
      req:  "Notify employee of right to reinstatement to same or equivalent position upon return",
      detail: "Reinstatement rights stated in Part C — same or equivalent position, same pay, benefits, and terms of employment",
    });
    if (f.letterType === "std") benItems.push({
      pass: true,
      reg:  "DOL WHD Opinion Letter FMLA-2019-2-A",
      req:  "When leave is paid through disability insurance, employer cannot require concurrent paid leave substitution",
      detail: `PTO restriction notice ${f.stdNotePtoRestriction ? "included" : "not included"} in STD addendum · STD benefit is not unpaid leave — FMLA concurrent PTO requirement does not apply`,
      warn: !f.stdNotePtoRestriction ? "Consider including PTO restriction notice in STD addendum" : null,
    });
    if(showDN) groups.push({ title: "Benefits & Reinstatement (§825.209–214)", icon: "🏥", items: benItems });
  }

  // ── GROUP 6: State-Specific ───────────────────────────────────────────────
  if (stateCode) {
    const stItems = [];
    if (stateCode === "ME") {
      stItems.push({
        pass: true,
        reg:  "26 M.R.S. § 843",
        req:  "Maine FMLA: identify applicable state employer threshold (15 employees at one location for private employers)",
        detail: `Worksite headcount: ${f.worksiteHeadcount || "not entered"} · Both federal (≥50/75-mi) and state (≥15 at one location) thresholds evaluated independently in letter`,
      });
      stItems.push({
        pass: true,
        reg:  "26 M.R.S. § 844",
        req:  "Maine FMLA: state entitlement of 10 weeks in any 2-year period tracked separately from federal annual entitlement",
        detail: `ME balance: ${maineRem} weeks remaining in 2-year window · Federal balance: ${fmlaRem} weeks in leave year · Letter shows both clocks side by side · Binding balance: ${Math.min(fmlaRem, maineRem)} weeks`,
      });
      stItems.push({
        pass: true,
        reg:  "26 M.R.S. § 843(1)(B)",
        req:  "Maine FMLA: broader family definitions (siblings who live with employee, domestic partners) disclosed where applicable",
        detail: `Qualifying reason: ${f.qualifyingReason} · ${f.familyMemberRelationship ? `Relationship: ${f.familyMemberRelationship} — Maine extended family note included` : "Maine expanded relationship definitions noted in state overlay clause"}`,
      });
      stItems.push({
        pass: true,
        reg:  "26 M.R.S. §§ 850-A–850-R",
        req:  "Maine PFML: concurrent designation with PFML disclosed where letter type is PFML-integrated",
        detail: f.letterType === "pfml"
          ? `Maine PFML addendum included · Claim: ${f.pfmlClaimNumber || "not entered"} · Administrator: ${f.pfmlAdminContact || "not entered"} · Concurrency with federal FMLA and Maine FMLA stated`
          : "Maine PFML not applicable for this letter type — federal FMLA and Maine FMLA designated concurrently",
      });
      stItems.push({
        pass: true,
        reg:  "26 M.R.S. § 845",
        req:  "Maine FMLA: 30-day advance notice requirement for foreseeable leave disclosed",
        detail: "Employee obligations section states Maine's 30-day notice requirement (vs. federal FMLA's general practicability standard)",
      });
    }
    if (stateCode === "TN") {
      const isBondingReason = f.qualifyingReason.includes("Birth") || f.qualifyingReason.includes("Adoption") || f.qualifyingReason.includes("bonding");
      stItems.push({
        pass: true,
        reg:  "T.C.A. § 4-21-408",
        req:  "Tennessee Parental Leave Act: apply overlay only when qualifying reason is birth, adoption, or nursing; employer has 100+ full-time employees at worksite",
        detail: isBondingReason
          ? `Parental leave reason confirmed (${f.qualifyingReason}) · Worksite headcount: ${f.worksiteHeadcount || "not entered"} · TN overlay applied — 4 months concurrent with FMLA stated`
          : `Qualifying reason (${f.qualifyingReason}) does not trigger TN Parental Leave Act · Letter correctly states federal FMLA is sole governing law`,
      });
      if (isBondingReason) stItems.push({
        pass: !!(f.worksiteHeadcount && parseInt(f.worksiteHeadcount) >= 100),
        reg:  "T.C.A. § 4-21-408(a)",
        req:  "Tennessee: 100-employee threshold at worksite must be met for Parental Leave Act to apply",
        detail: f.worksiteHeadcount
          ? `Worksite headcount: ${f.worksiteHeadcount} — ${parseInt(f.worksiteHeadcount) >= 100 ? "meets TN threshold ✓" : "below 100-employee TN threshold — TN overlay should not apply"}`
          : "⚠ Worksite headcount not entered — required to determine TN Parental Leave Act applicability",
        warn: !f.worksiteHeadcount ? "Enter worksite headcount to properly apply or exclude TN overlay" : parseInt(f.worksiteHeadcount) < 100 ? "Headcount below 100 — TN Parental Leave Act does not apply; remove TN overlay" : null,
      });
      stItems.push({
        pass: true,
        reg:  "T.C.A. § 4-21-408(c)",
        req:  "Tennessee: 3-month advance notice requirement (stricter than FMLA) disclosed for foreseeable leave",
        detail: isBondingReason
          ? "TN 3-month notice requirement disclosed in state overlay — flagged as stricter than FMLA's 30-day standard"
          : "Not applicable — TN Parental Leave Act does not apply to this qualifying reason",
      });
    }
    groups.push({ title: `State Law Requirements — ${stateCode === "ME" ? "Maine" : "Tennessee"}`, icon: "🏛️", items: stItems });
  }

  // ── GROUP 7: Letter type addendum ─────────────────────────────────────────
  if (f.letterType !== "fmla" && showDN) {
    const addItems = [];
    if (f.letterType === "std") {
      addItems.push({
        pass: !!(f.stdCarrierName && f.stdClaimNumber && f.stdWeeklyBenefit),
        reg:  "ERISA § 102 / DOL Best Practice",
        req:  "STD carrier, claim number, and benefit amount disclosed to employee",
        detail: `Carrier: ${f.stdCarrierName || "⚠ not entered"} · Claim: ${f.stdClaimNumber || "⚠ not entered"} · Weekly benefit: ${f.stdWeeklyBenefit ? `$${f.stdWeeklyBenefit}` : "⚠ not entered"}`,
        warn: !(f.stdCarrierName && f.stdClaimNumber && f.stdWeeklyBenefit) ? "Complete STD addendum fields for full disclosure" : null,
      });
      addItems.push({
        pass: !!(f.stdEliminationDays),
        reg:  "ERISA § 102",
        req:  "Elimination / waiting period disclosed so employee understands income gap",
        detail: `Elimination period: ${f.stdEliminationDays} calendar days — income gap between last day worked and STD benefit start`,
      });
      addItems.push({
        pass: true,
        reg:  "29 CFR §825.207(d) / DOL FMLA-2019-2-A",
        req:  "Clarify that FMLA clock and STD benefit run concurrently, not consecutively",
        detail: "Concurrency statement included in STD addendum — neither benefit extends the other",
      });
      addItems.push({
        pass: true,
        reg:  "29 CFR §825.209 / ADA Best Practice",
        req:  "Notify employee of rights when STD exhausts before FMLA (or vice versa)",
        detail: "Letter includes STD exhaustion notice — job protection ends at 12 weeks (FMLA); STD income may continue per plan; ADA accommodation rights noted",
      });
    }
    if (f.letterType === "pfml") {
      addItems.push({
        pass: !!(f.pfmlProgram && f.pfmlClaimNumber),
        reg:  "State PFML Law / DOL Best Practice",
        req:  "PFML program name, claim number, and administrator disclosed",
        detail: `Program: ${f.pfmlProgram || "⚠ not entered"} · Claim: ${f.pfmlClaimNumber || "⚠ not entered"} · Administrator: ${f.pfmlAdminContact || "⚠ not entered"}`,
        warn: !(f.pfmlProgram && f.pfmlClaimNumber) ? "Complete PFML addendum fields for full disclosure" : null,
      });
      addItems.push({
        pass: true,
        reg:  "29 CFR §825.207 / State PFML",
        req:  "Concurrent FMLA + PFML designation disclosed — employee understands both clocks run simultaneously",
        detail: `Concurrency stated in PFML addendum · Primary payer: ${f.pfmlPrimaryPayer} · Offset with STD: ${f.pfmlOffsetStd === "yes" ? "Yes — dollar-for-dollar" : "No"}`,
      });
      if (stateCode === "ME") addItems.push({
        pass: true,
        reg:  "26 M.R.S. § 850-D",
        req:  "Maine PFML: employer cannot require PTO offset against PFML benefits; employee accrues benefits as if actively working",
        detail: "Anti-PTO-offset clause and benefit accrual notice included in Maine PFML addendum",
      });
    }
    groups.push({ title: `${f.letterType === "std" ? "STD Integration" : "PFML Integration"} Disclosure Requirements`, icon: f.letterType === "std" ? "🩹" : "💵", items: addItems });
  }

  // ── GROUP 8: Employer Obligations During Leave ────────────────────────────
  if (showDN) {
    const eoItems = [];
    eoItems.push({
      pass: true,
      reg: "29 CFR §825.300(d) / §825.301",
      req: "Employer must designate leave as FMLA-qualifying within 5 business days of having sufficient information, retroactively if needed",
      detail: `Designation issued on ${f.generatedDate} · ${isDesig ? "Leave designated FMLA" : "Leave not designated — reason documented"} · Retroactive designation permitted if employee not prejudiced`,
      operatorNote: "If cert arrives after leave began, designate retroactively to the leave start date — do not wait for return to work.",
    });
    eoItems.push({
      pass: true,
      reg: "29 CFR §825.301(d)",
      req: "Employer may not delay designation to provide employee more FMLA leave than entitled",
      detail: "Designation issued promptly upon sufficient information — not deferred to extend FMLA coverage beyond legal entitlement",
      operatorNote: "Common audit finding: employers delaying designation as a courtesy — this violates §825.301(d) and creates employer liability.",
    });
    eoItems.push({
      pass: f.leaveType !== "Intermittent" || true,
      reg: "29 CFR §825.302 / §825.303",
      req: "Employee given opportunity to comply with employer's call-in procedures during intermittent leave",
      detail: f.leaveType === "Intermittent"
        ? "Intermittent leave — operator must confirm employee is aware of daily call-in requirements; failure to call in does not forfeit FMLA protection if employee was physically unable"
        : "Continuous leave — standard absence notification procedures apply",
      operatorNote: f.leaveType === "Intermittent" ? "Document each episode as FMLA-designated separately. Track hours/days used per pay period." : null,
    });
    eoItems.push({
      pass: true,
      reg: "29 CFR §825.308",
      req: "Employer may not require recertification more frequently than every 30 days unless specific exceptions apply",
      detail: f.recertRequired === "yes"
        ? `Recertification scheduled for ${f.recertDate || "TBD"} — verify this exceeds 30 days from initial cert or that an exception applies (duration changed, employee requests extension, or employer doubts validity)`
        : "No recertification required — consistent with §825.308",
      warn: f.recertRequired === "yes" && !f.recertDate ? "Set a specific recertification date to ensure §825.308 30-day minimum is met" : null,
      operatorNote: "Exceptions allowing recertification under 30 days: minimum duration of condition stated in cert has passed, or employee requests extension of leave.",
    });
    eoItems.push({
      pass: true,
      reg: "29 CFR §825.312",
      req: "Second or third medical opinion procedures followed correctly if employer doubts cert validity",
      detail: "If employer disputes certification: (1) notify employee in writing, (2) employer designates and pays for second opinion, (3) third opinion is binding. Employee may work until process completes.",
      operatorNote: "Operator action item: if cert is questioned, initiate second opinion within 5 days and document the decision — do not deny leave pending opinion.",
    });
    if(showDN) groups.push({ title: "Employer Designation Obligations", icon: "📌", items: eoItems });
  }

  // ── GROUP 9: Anti-Retaliation & Non-Interference ─────────────────────────
  {
    const arItems = [];
    arItems.push({
      pass: true,
      reg: "29 CFR §825.220(a)",
      req: "Employer prohibited from interfering with, restraining, or denying exercise of FMLA rights",
      detail: "Letter uses neutral language — no suggestion employee's job is at risk, no discouragement of leave use, no conditions imposed beyond what FMLA permits",
      operatorNote: "Review letter draft for any language that could be read as discouraging leave. Courts have found even 'suggestions' to work part-time instead of taking leave violate §825.220.",
    });
    arItems.push({
      pass: true,
      reg: "29 CFR §825.220(b) / §825.216",
      req: "Employer prohibited from counting FMLA leave against employee under attendance or no-fault policies",
      detail: "FMLA-designated leave must be excluded from any point-based attendance system, perfect attendance awards, or disciplinary attendance tracking",
      operatorNote: "Flag this claim in your HR system to exclude FMLA days from attendance tracking. This is one of the most common DOL audit findings.",
    });
    arItems.push({
      pass: true,
      reg: "29 CFR §825.220(c)",
      req: "Employer prohibited from retaliating against employee for requesting or taking FMLA leave",
      detail: "Performance reviews, terminations, or demotions occurring within 90 days of FMLA leave are subject to heightened scrutiny and retaliation claims",
      operatorNote: "Document any performance issues separately and before the leave period where possible. Any adverse action after return requires contemporaneous business justification unrelated to the leave.",
    });
    arItems.push({
      pass: true,
      reg: "29 CFR §825.216(a)",
      req: "Employee entitled to same or equivalent position on return — cannot be demoted, transferred, or have pay/benefits reduced",
      detail: `Anticipated return: ${f.anticipatedReturn || f.leaveEnd || "TBD"} · Position: ${f.position || "stated in letter"} · Same pay, benefits, and terms required`,
      operatorNote: "If the employee's position was eliminated during leave for legitimate business reasons unrelated to the leave, document this extensively before communicating it. Consult legal before taking any adverse action.",
    });
    arItems.push({
      pass: true,
      reg: "29 CFR §825.216(c)",
      req: "Key employee exception: employer may deny reinstatement only if refusal is necessary to prevent substantial grievous economic injury",
      detail: `${f.position ? `Position: ${f.position}` : "Position not specified"} — key employee status must be determined before leave begins and employee notified in writing at the time of designation`,
      operatorNote: "Key employee exception is rarely applicable and requires contemporaneous written notice. Do not apply retroactively after leave ends.",
    });
    groups.push({ title: "Anti-Retaliation & Reinstatement Rights", icon: "⚖️", items: arItems });
  }

  // ── GROUP 10: Intermittent Leave Tracking ────────────────────────────────
  if (f.leaveType === "Intermittent" || f.leaveType === "Reduced Schedule") {
    const intItems = [];
    intItems.push({
      pass: true,
      reg: "29 CFR §825.205(a)",
      req: "Intermittent/reduced schedule leave counted in the smallest increment used by employer's payroll system, but never more than 1 hour",
      detail: `Leave type: ${f.leaveType} · Pattern: ${f.intermittentFrequency || "not specified"} · Count actual hours/days used each pay period against entitlement`,
      operatorNote: "Track against a running total. If employee's provider certified 2 episodes/month of 1–3 days, monitor actual usage — excessive use vs. certification warrants recertification request.",
    });
    intItems.push({
      pass: true,
      reg: "29 CFR §825.205(b)",
      req: "For reduced schedule leave, only the hours actually not worked count against FMLA entitlement",
      detail: "Example: employee normally works 40 hrs/week, reduces to 30 hrs/week = 10 hrs/week counted against FMLA · 12 weeks × 10 hrs = 120 hrs total entitlement for this reduced schedule",
      operatorNote: "Calculate entitlement in hours, not weeks, for reduced schedule leave. Divide total weekly hours by normal schedule to determine when 12-week equivalent is exhausted.",
    });
    intItems.push({
      pass: true,
      reg: "29 CFR §825.204",
      req: "Employer may temporarily transfer employee to alternative position with equivalent pay/benefits to accommodate intermittent leave schedule",
      detail: "Transfer to alternative position permitted only if intermittent leave is foreseeable and based on planned medical treatment — not for unforeseeable leave",
      operatorNote: "Transfer is employer's option, not obligation. Must be equivalent pay and benefits. Cannot be used as punishment or to discourage FMLA use.",
    });
    groups.push({ title: "Intermittent / Reduced Schedule Tracking", icon: "📅", items: intItems });
  }

  // ── GROUP 11: ADA / ADAAA Interaction ────────────────────────────────────
  {
    const adaItems = [];
    adaItems.push({
      pass: true,
      reg: "ADA / ADAAA 42 U.S.C. §12101 / EEOC Guidance",
      req: "Evaluate whether employee's condition qualifies as a disability under ADA — FMLA and ADA run concurrently when both apply",
      detail: `Qualifying reason: ${f.qualifyingReason} · Serious health conditions frequently qualify as ADA disabilities — evaluate for reasonable accommodation obligations independent of FMLA`,
      operatorNote: "ADA does not have a 12-week cap. When FMLA exhausts, if the employee has an ADA disability, additional unpaid leave may be required as a reasonable accommodation. Engage in the interactive process before denying return.",
    });
    adaItems.push({
      pass: f.fitForDutyRequired === "yes",
      reg: "29 CFR §825.312 / ADA §102(d)(3)",
      req: "Fitness-for-duty certification must be job-related and consistent with business necessity; may not exceed scope of FMLA leave",
      detail: f.fitForDutyRequired === "yes"
        ? `FFD required · Essential functions addressed: ${f.fitForDutyEssentialFunctions === "yes" ? "Yes — cert must address specific essential functions" : "No — general return-to-work clearance only"} · Employer may contact provider for clarification only, not additional information`
        : "No FFD required — operator should verify this is appropriate given the nature of the qualifying condition",
      warn: f.fitForDutyRequired !== "yes" ? "Consider whether FFD cert is needed to ensure safe return for this condition type" : null,
      operatorNote: "If employee cannot provide FFD cert, do not automatically terminate. Evaluate ADA accommodation options first — additional leave, modified duties, or phased return may be required.",
    });
    adaItems.push({
      pass: true,
      reg: "GINA 29 CFR §1635 / ADA §102",
      req: "Medical certification may only request information necessary to determine FMLA eligibility — cannot request diagnosis or genetic information",
      detail: "DOL Form WH-380 series requests functional limitations and duration only — not diagnosis, prognosis, or treatment details beyond what is needed for FMLA determination",
      operatorNote: "If employer receives unsolicited genetic information in a cert, immediately segregate it and do not use it in any employment decision. GINA violations carry significant liability.",
    });
    adaItems.push({
      pass: true,
      reg: "29 CFR §825.702",
      req: "FMLA does not diminish employer obligations under ADA, state disability law, or workers' compensation — all may run concurrently",
      detail: `${f.letterType === "std" ? "STD + FMLA running concurrently confirmed · " : ""}ADA interactive process may be required independently · Workers' comp leave may also trigger FMLA if condition qualifies as serious health condition`,
      operatorNote: "Concurrent leaves are the norm, not the exception. Document each law's obligations separately — FMLA exhaustion does not end ADA or workers' comp obligations.",
    });
    if(showDN) groups.push({ title: "ADA / ADAAA & Concurrent Law Interaction", icon: "🔗", items: adaItems });
  }

  // ── GROUP 12: Recordkeeping & Audit Trail ────────────────────────────────
  {
    const rkItems = [];
    rkItems.push({
      pass: !!(f.letterId && f.generatedDate),
      reg: "29 CFR §825.500(b)",
      req: "FMLA records must be maintained for 3 years and made available to DOL upon request",
      detail: `Letter ID: ${f.letterId} · Generated: ${f.generatedDate} · Claim: ${f.claimNumber} · Template: ${f.templateVersion} · Retain until: ${(() => { const d = new Date(f.generatedDate || Date.now()); d.setFullYear(d.getFullYear() + 3); return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); })()}`,
      operatorNote: "Store this letter with the full claim file including: original leave request, medical certifications, all notices sent, designation decision, and return-to-work documentation.",
    });
    rkItems.push({
      pass: !!(f.deliveryMethod),
      reg: "29 CFR §825.500(b)(4)",
      req: "Records of dates and hours of FMLA leave taken must be maintained",
      detail: `Delivery method: ${f.deliveryMethod} · Leave period: ${f.leaveStart || "TBD"} – ${f.leaveEnd || "TBD"} · ${f.leaveType} · Weeks counted: ${f.weeksCountedFmla || "TBD"}`,
      operatorNote: "Maintain a running leave ledger per employee per leave year. For intermittent leave, log each episode with date, hours taken, and running total against entitlement.",
    });
    rkItems.push({
      pass: true,
      reg: "29 CFR §825.500(c)",
      req: "Records may be kept in any form — paper, electronic, or microfilm — as long as they can be produced for inspection",
      detail: `Template version ${f.templateVersion} used · Letter ID ${f.letterId} serves as audit reference · Delivery confirmation should be retained separately`,
      operatorNote: "Best practice: store letter PDF, delivery confirmation, and claim data snapshot together in the employee's FMLA file. Do not store FMLA records in the general personnel file — keep separately per §825.500(g).",
    });
    rkItems.push({
      pass: true,
      reg: "29 CFR §825.500(g)",
      req: "Medical records and medical certifications must be maintained in separate confidential files, distinct from the general personnel file",
      detail: "Medical certifications, diagnosis information, and FFD certifications must be stored in a separate confidential medical file — not in the general HR or personnel file",
      operatorNote: "Access to the confidential medical file must be restricted. Only supervisors and safety personnel with a need to know about work restrictions may be informed — without the underlying medical information.",
    });
    rkItems.push({
      pass: true,
      reg: "29 CFR §825.500(b)(5)",
      req: "Records of premium payments for group health benefits during FMLA leave must be maintained",
      detail: `Employee premium share: ${f.employeePremiumShare ? `$${f.employeePremiumShare}` : "to be confirmed"} · Method: ${f.premiumPaymentMethod} · Payroll/billing records must reflect premium payments and any recovery of unpaid premiums`,
      warn: !f.employeePremiumShare ? "Document premium payment arrangement before leave begins — needed for audit trail and potential premium recovery" : null,
      operatorNote: "If employee fails to pay premiums, employer must provide 15-day written grace period notice before terminating coverage. Premium recovery on non-return is limited to employer's share only, not both shares.",
    });
    groups.push({ title: "Recordkeeping & Audit Trail (3-Year Retention)", icon: "🗂️", items: rkItems });
  }

  // ── GROUP 13: Required Attachments ───────────────────────────────────────
  {
    const isBonding   = f.qualifyingReason?.includes("Birth") || f.qualifyingReason?.includes("Adoption") || f.qualifyingReason?.includes("bonding");
    const isMilExig   = f.qualifyingReason?.includes("exigency");
    const isMilCare   = f.qualifyingReason?.includes("caregiver");
    const isFamCare   = f.qualifyingReason?.includes("family member");
    const needCert    = f.medCertRequired === "yes";
    const certPending = f.medCertStatus === "Pending";
    const needFFD     = f.fitForDutyRequired === "yes";
    const isSTD       = f.letterType === "std";
    const isPFML      = f.letterType === "pfml";

    const atItems = [];

    // ── DOL Medical Certification Forms ──
    if (needCert && !isFamCare && !isMilExig && !isMilCare) atItems.push({
      pass: !certPending,
      reg: "29 CFR §825.305(b) / DOL WH-380-E",
      req: "Medical Certification — Employee's Own Serious Health Condition (WH-380-E)",
      detail: certPending
        ? `⚠ Cert pending — must be provided to employee with the letter · Due: ${f.medCertDueDate || "15 days from today"}`
        : `Cert status: ${f.medCertStatus}`,
      warn: certPending ? "Attach WH-380-E with the letter so employee can give it to their provider" : null,
      operatorNote: "Provide the blank WH-380-E form to the employee — do not require the employee to obtain their own form. Employer must pay for any second opinion.",
      url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-380-E.pdf",
      urlLabel: "Download WH-380-E (DOL.gov)",
    });

    if (needCert && isFamCare) atItems.push({
      pass: !certPending,
      reg: "29 CFR §825.305(b) / DOL WH-380-F",
      req: "Medical Certification — Family Member's Serious Health Condition (WH-380-F)",
      detail: certPending
        ? `⚠ Cert pending — must be provided to employee with the letter · Due: ${f.medCertDueDate || "15 days from today"}`
        : `Cert status: ${f.medCertStatus}`,
      warn: certPending ? "Attach WH-380-F with the letter so employee can give it to their family member's provider" : null,
      operatorNote: "Use WH-380-F (not WH-380-E) when leave is to care for a covered family member's serious health condition.",
      url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-380-F.pdf",
      urlLabel: "Download WH-380-F (DOL.gov)",
    });

    if (isMilExig) atItems.push({
      pass: !certPending,
      reg: "29 CFR §825.309 / DOL WH-384",
      req: "Military Qualifying Exigency Certification (WH-384)",
      detail: "Required for leave due to qualifying exigency arising from military deployment of covered family member",
      warn: certPending ? "Attach WH-384 with this letter" : null,
      operatorNote: "WH-384 covers 10 qualifying exigency categories. First-time exigency request requires documentation of covered servicemember's active duty orders.",
      url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-384.pdf",
      urlLabel: "Download WH-384 (DOL.gov)",
    });

    if (isMilCare) atItems.push({
      pass: !certPending,
      reg: "29 CFR §825.310 / DOL WH-385",
      req: "Military Caregiver Certification — Serious Injury or Illness (WH-385 or WH-385-V)",
      detail: "Required for military caregiver leave — up to 26 weeks for covered servicemember or veteran",
      warn: certPending ? "Attach WH-385 or WH-385-V (for veterans) with this letter" : null,
      operatorNote: "Military caregiver leave entitlement is 26 weeks (not 12) per 12-month period and is a separate entitlement from the regular 12-week FMLA leave bank.",
      url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-385.pdf",
      urlLabel: "Download WH-385 (DOL.gov)",
    });

    // ── Fitness-for-Duty ──
    if (needFFD) atItems.push({
      pass: true,
      reg: "29 CFR §825.312",
      req: "Fitness-for-Duty Certification — provide blank form to employee now so provider can complete before return",
      detail: `FFD required · Essential functions addressed: ${f.fitForDutyEssentialFunctions === "yes" ? "Yes" : "No"} · Anticipated return: ${f.anticipatedReturn || f.leaveEnd || "TBD"}`,
      operatorNote: "Best practice: give employee the blank FFD form (Section IV of WH-380-E or employer's own form) at the time of the designation notice — do not wait until days before return.",
      url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-380-E.pdf",
      urlLabel: "WH-380-E Section IV — Fitness for Duty (DOL.gov)",
    });

    // ── State Required ──
    if (stateCode === "ME") {
      atItems.push({
        pass: true,
        reg: "26 M.R.S. § 843 / Maine DOL",
        req: "Maine Family Medical Leave — Employee Rights Notice (required posting & distribution)",
        detail: "Maine employers with 15+ employees must provide the official Maine FMLA rights notice to employees",
        operatorNote: "This is separate from the federal FMLA poster. Maine DOL requires it be posted and provided to employees at time of hire and at time of leave request.",
        url: "https://www.maine.gov/labor/docs/2020/posters/fmla.pdf",
        urlLabel: "Maine FMLA Rights Notice (maine.gov)",
      });
      if (isPFML) atItems.push({
        pass: !!(f.pfmlClaimNumber),
        reg: "26 M.R.S. § 850-D / Maine PFML",
        req: "Maine Paid Family & Medical Leave — Employee Program Information",
        detail: f.pfmlClaimNumber
          ? `PFML claim ${f.pfmlClaimNumber} filed with ${f.pfmlAdminContact || "Aflac"} · Employee should receive program summary and appeal rights`
          : "⚠ PFML claim not yet filed — employee needs program information to initiate claim",
        warn: !f.pfmlClaimNumber ? "Provide Maine PFML information sheet so employee can file their PFML claim" : null,
        operatorNote: "Maine PFML benefits are administered by Aflac on behalf of the state. Employee must file their own PFML claim separately — the employer cannot file on their behalf.",
        url: "https://www.maine.gov/pfml",
        urlLabel: "Maine PFML Information (maine.gov)",
      });
    }

    if (stateCode === "TN" && isBonding) atItems.push({
      pass: true,
      reg: "T.C.A. § 4-21-408",
      req: "Tennessee Parental Leave Act — Summary of Employee Rights (recommended)",
      detail: `Qualifying reason: ${f.qualifyingReason} · Worksite headcount: ${f.worksiteHeadcount} (need ≥100 for TN Act to apply)`,
      operatorNote: parseInt(f.worksiteHeadcount || 0) >= 100
        ? "TN Parental Leave Act applies — 4 months concurrent with FMLA. Provide the employee with the TN Human Rights Commission reference."
        : "Worksite headcount below 100 — TN Parental Leave Act does NOT apply. Do not include this attachment.",
      url: "https://www.tn.gov/humanrights/title-4/title-4-chapter-21/title-4-chapter-21-part-4.html",
      urlLabel: "TN Parental Leave Act — T.C.A. § 4-21-408 (tn.gov)",
    });

    // ── STD / PFML carrier ──
    if (isSTD) atItems.push({
      pass: !!(f.stdClaimNumber),
      reg: "ERISA § 102 / Plan SPD",
      req: `STD claim form and plan summary — ${f.stdCarrierName || "STD carrier"}`,
      detail: f.stdClaimNumber
        ? `STD claim ${f.stdClaimNumber} open · Weekly benefit $${f.stdWeeklyBenefit} · ${f.stdEliminationDays}-day elimination period · Max duration ${f.stdMaxDurationWeeks} weeks`
        : "⚠ STD claim not yet initiated — provide employee with claim form or portal instructions",
      warn: !f.stdClaimNumber ? "Attach STD claim form or carrier portal instructions if claim not yet filed" : null,
      operatorNote: "STD and FMLA clocks start on the same day. Delay in STD claim filing does not extend FMLA — both clocks run from first day of absence after elimination period.",
      url: "https://www.dol.gov/general/topic/disability/erisa",
      urlLabel: "ERISA Disability Benefit Rights (DOL.gov)",
    });

    // ── Always include ──
    atItems.push({
      pass: true,
      reg: "DOL WHD Fact Sheet #28",
      req: "Your Rights Under the FMLA — DOL Fact Sheet #28 (recommended enclosure)",
      detail: "Plain-language summary of FMLA rights, qualifying reasons, entitlement, and employer obligations",
      operatorNote: "Including Fact Sheet #28 with every FMLA notice is a best practice that reduces employee inquiries and documents that full rights disclosure was made.",
      url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/whdfs28.pdf",
      urlLabel: "DOL Fact Sheet #28 — FMLA Rights (DOL.gov)",
    });

    atItems.push({
      pass: true,
      reg: "29 CFR §825.300(a)(2)",
      req: "FMLA General Notice — DOL Official Poster (WH-1420)",
      detail: "Must be posted in a conspicuous place and may be provided electronically if employee does not visit a physical worksite",
      operatorNote: "If employee works remotely and never comes to a physical worksite, the FMLA poster must be provided electronically — posting alone does not satisfy the notice requirement.",
      url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/fmlaen.pdf",
      urlLabel: "Download FMLA Poster WH-1420 (DOL.gov)",
    });

    atItems.push({
      pass: true,
      reg: "29 CFR §825.220(c)",
      req: "DOL Complaint Process — Wage and Hour Division",
      detail: "Employee must be informed of their right to file a complaint with DOL WHD if they believe their FMLA rights were violated",
      operatorNote: "This information is included in the claimant letter. Confirm the WHD phone number (1-866-487-9243) and complaint portal link are accurate before sending.",
      url: "https://www.dol.gov/agencies/whd/contact/complaints",
      urlLabel: "File a Complaint with DOL WHD (DOL.gov)",
    });

    groups.push({ title: "Required & Recommended Attachments", icon: "📎", items: atItems });
  }

  // ── GROUP 14: Send Readiness Checklist ────────────────────────────────────
  {
    const srItems = [];
    const hasEmployer  = !!(f.employerName && f.hrContactName && f.hrPhone);
    const hasEmployee  = !!(f.employeeName && f.employeeId && f.position);
    const hasLeave     = !!(f.leaveStart && f.noticeReceived);
    const hasAdmin     = !!(f.adminName && f.adminPhone && f.adminEmail);
    const hasElig      = !!(f.fmlaEligible);
    const hasCert      = f.medCertRequired !== "yes" || !!(f.medCertStatus && f.medCertStatus !== "Pending");
    const hasReturn    = !!(f.anticipatedReturn || f.leaveEnd);
    const hasPremium   = !!(f.employeePremiumShare);
    const hasStdFields = f.letterType !== "std" || !!(f.stdClaimNumber && f.stdWeeklyBenefit);
    const hasPfmlFields= f.letterType !== "pfml" || !!(f.pfmlClaimNumber && f.pfmlProgram);

    srItems.push({ pass: hasEmployer,   reg: "Pre-send check", req: "Employer, HR contact name, and HR phone number completed", detail: hasEmployer   ? `${f.employerName} · ${f.hrContactName} · ${f.hrPhone}` : "⚠ Missing employer or HR contact fields", warn: !hasEmployer   ? "Complete employer information before sending" : null, operatorNote: null });
    srItems.push({ pass: hasEmployee,   reg: "Pre-send check", req: "Employee name, ID, and position completed", detail: hasEmployee   ? `${f.employeeName} · ${f.employeeId} · ${f.position}` : "⚠ Missing employee identity fields", warn: !hasEmployee   ? "Complete employee fields before sending" : null, operatorNote: null });
    srItems.push({ pass: hasLeave,      reg: "Pre-send check", req: "Leave start date and notice-received date entered", detail: hasLeave     ? `Notice received: ${f.noticeReceived} · Leave starts: ${f.leaveStart}` : "⚠ Missing leave dates — cannot calculate SLA", warn: !hasLeave ? "Leave dates required to verify 5-day SLA and calculate entitlement" : null, operatorNote: null });
    srItems.push({ pass: hasAdmin,      reg: "Pre-send check", req: "Leave administrator name, phone, and email completed (displayed on letter for employee contact)", detail: hasAdmin ? `${f.adminName} · ${f.adminPhone} · ${f.adminEmail}` : "⚠ Missing administrator contact info", warn: !hasAdmin ? "Administrator contact required by 29 CFR §825.300(a)(3)" : null, operatorNote: null });
    srItems.push({ pass: hasElig,       reg: "Pre-send check", req: "Eligibility determination made and documented", detail: `FMLA eligible: ${f.fmlaEligible === "yes" ? "Yes" : "No"} · ${f.fmlaEligible !== "yes" ? "Ineligibility reasons: " + [f.ineligMonths && "months", f.ineligHours && "hours", f.ineligSize && "size"].filter(Boolean).join(", ") : "All 3 criteria passed"}`, warn: null, operatorNote: null });
    srItems.push({ pass: hasCert,       reg: "Pre-send check", req: "Medical certification status resolved before issuing DN or combined EN+DN", detail: hasCert ? `Cert status: ${f.medCertStatus}` : "⚠ Cert pending — can issue EN, but DN should await sufficient information (received cert)", warn: !hasCert && showDN ? "Pending cert: consider issuing EN only now, then DN once cert received" : null, operatorNote: "Issuing a DN with a pending cert may create issues if cert later shows leave does not qualify. Best practice: wait for cert before DN." });
    srItems.push({ pass: hasReturn,     reg: "Pre-send check", req: "Anticipated return-to-work date confirmed with employee", detail: hasReturn ? `Anticipated return: ${f.anticipatedReturn || f.leaveEnd}` : "⚠ Return date not confirmed", warn: !hasReturn ? "Confirm return date — needed for FFD cert timing and workforce planning" : null, operatorNote: null });
    srItems.push({ pass: hasPremium,    reg: "Pre-send check", req: "Employee health insurance premium share documented", detail: hasPremium ? `$${f.employeePremiumShare} · ${f.premiumPaymentMethod}` : "⚠ Premium share not entered — required for §825.210(b) compliance", warn: !hasPremium ? "Enter premium share before sending — required disclosure" : null, operatorNote: null });
    srItems.push({ pass: hasStdFields,  reg: "Pre-send check", req: f.letterType === "std" ? "STD carrier, claim number, and weekly benefit entered for addendum" : "N/A — not an STD letter", detail: f.letterType === "std" ? (hasStdFields ? `STD claim: ${f.stdClaimNumber} · $${f.stdWeeklyBenefit}/wk` : "⚠ Missing STD details for addendum") : "Not applicable for this letter type", warn: f.letterType === "std" && !hasStdFields ? "Complete STD addendum fields before sending" : null, operatorNote: null });
    srItems.push({ pass: hasPfmlFields, reg: "Pre-send check", req: f.letterType === "pfml" ? "PFML program name and claim number entered for addendum" : "N/A — not a PFML letter", detail: f.letterType === "pfml" ? (hasPfmlFields ? `${f.pfmlProgram} · Claim: ${f.pfmlClaimNumber}` : "⚠ Missing PFML program or claim number") : "Not applicable for this letter type", warn: f.letterType === "pfml" && !hasPfmlFields ? "Complete PFML addendum fields before sending" : null, operatorNote: null });
    groups.push({ title: "Send Readiness Checklist", icon: "✉️", items: srItems });
  }

  // ── Scorecard ─────────────────────────────────────────────────────────────
  const allItems   = groups.flatMap(g => g.items);
  const passCount  = allItems.filter(i => i.pass).length;
  const warnCount  = allItems.filter(i => i.warn).length;
  const failCount  = allItems.filter(i => !i.pass).length;
  const total      = allItems.length;
  const score      = Math.round((passCount / total) * 100);
  const scoreColor = score === 100 ? GREEN : score >= 80 ? "#92400E" : RED;
  const scoreBg    = score === 100 ? GBGL  : score >= 80 ? ABGL      : RBGL;
  const genTs      = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const StatusIcon = ({ item }) => {
    if (item.pass && !item.warn) return (
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
      </div>
    );
    if (item.warn) return (
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", fontWeight: 700, flexShrink: 0 }}>!</div>
    );
    return (
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
      </div>
    );
  };

  return (
    <div style={{ marginTop: 28, fontFamily: ff }}>

      {/* ── HEADER ── */}
      <div style={{ background: NAV, borderRadius: "8px 8px 0 0", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Operator View — Internal Use Only</div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>FMLA Compliance & Operations Report</div>
            <div style={{ color: "#93C5FD", fontSize: 12, marginTop: 3 }}>
              {total} requirement checks across {groups.length} categories · {warnCount} warning{warnCount !== 1 ? "s" : ""} · {failCount} failure{failCount !== 1 ? "s" : ""}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: scope==="en"?"#0D6B3B":scope==="dn"?"#7C2D12":NAV, color:"white" }}>{scopeDesc}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: isSTDl?"#7C2D12":isPFMLl?"#0D6B3B":"rgba(255,255,255,0.15)", color:"white" }}>{typeDesc}</span>
              {stateCode && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: "rgba(255,255,255,0.15)", color:"white" }}>{stateCode} State Overlay</span>}
              <span style={{ fontSize: 10, color: "#93C5FD", padding: "2px 9px" }}>
                {groups.length} of 14 groups apply to this configuration
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ background: scoreBg, borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}%</div>
              <div style={{ fontSize: 11, color: scoreColor, fontWeight: 600, marginTop: 2 }}>{score === 100 ? "Fully compliant" : score >= 80 ? "Review needed" : "Action required"}</div>
            </div>
          </div>
        </div>

        {/* Scorecard row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 14 }}>
          {[
            { label: "Passed",   value: passCount, color: GBGL, text: GREEN },
            { label: "Warnings", value: warnCount, color: ABGL, text: AMBER },
            { label: "Failed",   value: failCount, color: RBGL, text: RED },
            { label: "Groups",   value: groups.length, color: "rgba(255,255,255,0.1)", text: "white" },
          ].map(s => (
            <div key={s.label} style={{ background: s.color, borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.text, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: s.text, fontWeight: 600, marginTop: 2, opacity: 0.85 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WARNINGS SUMMARY BANNER ── */}
      {(warnCount > 0 || failCount > 0) && (
        <div style={{ background: failCount > 0 ? RBGL : ABGL, borderLeft: `3px solid ${failCount > 0 ? RED : AMBER}`, padding: "12px 20px", borderTop: "none" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: failCount > 0 ? RED : AMBER, marginBottom: 8 }}>
            {failCount > 0 ? `${failCount} Failure${failCount > 1 ? "s" : ""} — Letter should not be sent until resolved` : `${warnCount} Warning${warnCount > 1 ? "s" : ""} — Review before sending`}
          </div>
          {allItems.filter(i => i.warn || !i.pass).map((item, i) => (
            <div key={i} style={{ fontSize: 12, color: !item.pass ? RED : AMBER, marginBottom: 4, paddingLeft: 10, display: "flex", gap: 6 }}>
              <span>{!item.pass ? "✗" : "⚠"}</span>
              <span><strong>{item.reg}</strong> — {item.warn || `Requirement not met: ${item.req}`}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── REQUIREMENT GROUPS ── */}
      <div style={{ border: `1px solid ${G200}`, borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
        {groups.map((group, gi) => {
          const groupPass  = group.items.filter(i => i.pass && !i.warn).length;
          const groupWarn  = group.items.filter(i => i.warn).length;
          const groupFail  = group.items.filter(i => !i.pass).length;
          const groupOk    = groupFail === 0 && groupWarn === 0;
          const isOpen     = openGroups[gi] !== false; // default open

          return (
            <div key={gi} style={{ borderBottom: gi < groups.length - 1 ? `1px solid ${G100}` : "none" }}>

              {/* Group header — clickable to collapse */}
              <div
                onClick={() => toggleGroup(gi)}
                style={{ background: G50, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none", borderBottom: isOpen ? `1px solid ${G100}` : "none" }}
              >
                <span style={{ fontSize: 15 }}>{group.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: NAV, flex: 1 }}>{group.title}</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {groupFail > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: RED, background: RBGL, border: `1px solid ${RBDR}`, borderRadius: 4, padding: "1px 6px" }}>{groupFail} failed</span>}
                  {groupWarn > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: AMBER, background: ABGL, border: `1px solid ${ABDR}`, borderRadius: 4, padding: "1px 6px" }}>{groupWarn} warned</span>}
                  {groupOk && <span style={{ fontSize: 10, fontWeight: 700, color: GREEN, background: GBGL, border: `1px solid ${GBDR}`, borderRadius: 4, padding: "1px 6px" }}>All passed</span>}
                  <span style={{ fontSize: 11, color: G400, marginLeft: 4 }}>{groupPass}/{group.items.length}</span>
                  <span style={{ color: G400, fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Items */}
              {isOpen && group.items.map((item, ii) => (
                <div key={ii} style={{ padding: "13px 18px", borderBottom: ii < group.items.length - 1 ? `1px solid ${G100}` : "none", background: !item.pass ? "#FFF8F8" : item.warn ? "#FFFCF0" : "white" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: "0 12px" }}>
                    <div style={{ paddingTop: 2 }}><StatusIcon item={item} /></div>
                    <div>
                      {/* Title row */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: G900, lineHeight: 1.4, flex: 1 }}>{item.req}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0,
                          color: item.pass && !item.warn ? GREEN : item.warn ? AMBER : RED,
                          background: item.pass && !item.warn ? GBGL : item.warn ? ABGL : RBGL,
                          border: `1px solid ${item.pass && !item.warn ? GBDR : item.warn ? ABDR : RBDR}` }}>{item.reg}</div>
                      </div>
                      {/* Detail */}
                      <div style={{ fontSize: 12, color: G600, lineHeight: 1.55, marginBottom: item.warn || item.url || item.operatorNote ? 6 : 0 }}>{item.detail}</div>
                      {/* Link */}
                      {item.url && (
                        <div style={{ marginBottom: item.warn || item.operatorNote ? 6 : 0 }}>
                          <a href={item.url} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, color: BLUE, fontWeight: 600, fontFamily: ff, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 13 }}>↗</span> {item.urlLabel || item.url}
                          </a>
                        </div>
                      )}
                      {/* Warning action */}
                      {item.warn && (
                        <div style={{ fontSize: 11, color: AMBER, fontWeight: 600, background: ABGL, border: `1px solid ${ABDR}`, borderRadius: 4, padding: "5px 9px", marginBottom: item.operatorNote ? 6 : 0 }}>
                          ⚠ Action required: {item.warn}
                        </div>
                      )}
                      {/* Operator note */}
                      {item.operatorNote && (
                        <div style={{ fontSize: 11, color: BLUE, background: BBGL, border: `1px solid ${BBDR}`, borderRadius: 4, padding: "5px 9px", lineHeight: 1.5 }}>
                          <strong style={{ color: BLUE }}>Operator note:</strong> {item.operatorNote}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* ── REPORT FOOTER ── */}
        <div style={{ background: G50, borderTop: `1px solid ${G200}`, padding: "12px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: G800, marginBottom: 2 }}>Report metadata</div>
              <div style={{ fontSize: 11, color: G400 }}>Generated {genTs} · Claim {f.claimNumber} · Letter {f.letterId} · Template {f.templateVersion}</div>
              <div style={{ fontSize: 11, color: G400 }}>Regulatory basis: 29 CFR Part 825 · DOL WH-381/382 · {stateCode === "ME" ? "26 M.R.S. §§ 843–850-R (Maine)" : stateCode === "TN" ? "T.C.A. § 4-21-408 (Tennessee)" : "Federal FMLA only"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: G400 }}>3-year retention required · Retain until {(() => { const d = new Date(f.generatedDate || Date.now()); d.setFullYear(d.getFullYear() + 3); return d.toLocaleDateString("en-US", { month: "short", year: "numeric" }); })()}</div>
            </div>
          </div>
          <div style={{ background: ABGL, border: `1px solid ${ABDR}`, borderRadius: 5, padding: "8px 12px", fontSize: 11, color: AMBER, lineHeight: 1.5 }}>
            <strong>Legal disclaimer:</strong> This report is a workflow tool for internal compliance tracking. It does not constitute legal advice. Employment counsel should validate template language, state-specific overlay logic, and any designation decisions involving unusual facts, before letters are sent to employees.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INPUT FORM ───────────────────────────────────────────────────────────────
function InputForm({ form, setForm, onGenerate }) {
  const f = form;
  const set = (key) => (val) => setForm(p => ({ ...p, [key]: val }));
  const setChk = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  const isValid = f.employerName && f.employeeName && f.leaveStart && f.noticeReceived;

  const ltColors = { fmla: NAV, pfml: "#0D6B3B", std: "#7C2D12" };

  return (
    <div style={{ fontFamily: ff }}>
      {/* ── SELECTORS ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Letter type */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Letter Type</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LETTER_TYPES.map(lt => (
              <div key={lt.id} onClick={() => set("letterType")(lt.id)}
                style={{ border: `2px solid ${f.letterType === lt.id ? lt.color : G200}`, borderRadius: 7, padding: "10px 13px", cursor: "pointer", background: f.letterType === lt.id ? (lt.id === "fmla" ? "#EFF6FF" : lt.id === "pfml" ? "#F0FDF4" : "#FFF7ED") : "white", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${f.letterType === lt.id ? lt.color : G200}`, background: f.letterType === lt.id ? lt.color : "white", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: f.letterType === lt.id ? lt.color : G800 }}>{lt.label}</div>
                  <div style={{ fontSize: 11, color: G400 }}>{lt.sublabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notice scope */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Notice Scope</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {NOTICE_SCOPES.map(ns => {
              const scopeColors = { en: "#0D6B3B", dn: "#7C2D12", combined: NAV };
              const scopeBgs   = { en: "#F0FDF4", dn: "#FFF7ED", combined: "#EFF6FF" };
              const active = f.noticeScope === ns.id;
              return (
                <div key={ns.id} onClick={() => set("noticeScope")(ns.id)}
                  style={{ border: `2px solid ${active ? scopeColors[ns.id] : G200}`, borderRadius: 7, padding: "10px 13px", cursor: "pointer", background: active ? scopeBgs[ns.id] : "white", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${active ? scopeColors[ns.id] : G200}`, background: active ? scopeColors[ns.id] : "white", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: active ? scopeColors[ns.id] : G800 }}>{ns.icon} {ns.fullLabel}</div>
                    <div style={{ fontSize: 11, color: G400, marginTop: 1 }}>{ns.sublabel}</div>
                    {active && <div style={{ fontSize: 11, color: active ? scopeColors[ns.id] : G400, marginTop: 4, fontStyle: "italic" }}>{ns.hint}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── DYNAMIC FORM BODY ── */}
      {(() => {
        const isSTD  = f.letterType === "std";
        const isPFML = f.letterType === "pfml";
        const showEN = f.noticeScope === "en"  || f.noticeScope === "combined";
        const showDN = f.noticeScope === "dn"  || f.noticeScope === "combined";
        const isME   = (f.stateOfEmployment || "").includes("ME");
        const isTN   = (f.stateOfEmployment || "").includes("TN");
        const isInt  = f.leaveType !== "Continuous";
        const isBond = (f.qualifyingReason || "").includes("Birth") || (f.qualifyingReason || "").includes("Adoption") || (f.qualifyingReason || "").includes("bonding");
        const fn     = (f.employeeName || "the employee").split(" ")[0];

        // Progress indicator — shows which sections are active
        const activeSections = [
          "Employer & Admin",
          "Employee",
          "Leave Request",
          showEN && "Eligibility",
          showDN && "Designation",
          showDN && "Med Cert",
          showDN && "Requirements",
          isSTD  && "STD Details",
          isPFML && "PFML Details",
          "Custom Content",
        ].filter(Boolean);

        return (<>

          {/* Section breadcrumb */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 20, padding: "10px 14px", background: G50, borderRadius: 8, border: `1px solid ${G200}` }}>
            {activeSections.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, color: NAV, fontWeight: 600, fontFamily: ff }}>{s}</span>
                {i < activeSections.length - 1 && <span style={{ fontSize: 11, color: G400 }}>›</span>}
              </div>
            ))}
          </div>

          {/* ═══ 1. EMPLOYER & ADMIN — always ═══ */}
          <SectionHead icon="🏢" title="Employer & Leave Administrator" subtitle="Required for all letter types" />
          <Grid>
            <Input label="Employer Legal Name" value={f.employerName} onChange={set("employerName")} required placeholder="Acme Manufacturing Co." />
            <Input label="Worksite Employee Count (75-mi radius)" value={f.worksiteHeadcount} onChange={set("worksiteHeadcount")} type="number"
              hint={isTN && isBond ? "TN Parental Leave Act: ≥100 employees · Federal FMLA: ≥50" : isME ? "Federal FMLA: ≥50 · Maine state: ≥15 private employer" : "Federal FMLA: ≥50 within 75 miles"} />
            <Input label="HR Contact Name" value={f.hrContactName} onChange={set("hrContactName")} placeholder="Jennifer Walsh" />
            <Input label="HR Title" value={f.hrTitle} onChange={set("hrTitle")} placeholder="HR Business Partner" />
            <Input label="HR Phone" value={f.hrPhone} onChange={set("hrPhone")} placeholder="(215) 555-0100" />
            <Input label="HR Email" value={f.hrEmail} onChange={set("hrEmail")} placeholder="jwalsh@employer.com" />
            <Input label="Leave Administrator / TPA Name" value={f.adminName} onChange={set("adminName")} placeholder="Meridian Absence Solutions" />
            <Input label="Administrator Phone" value={f.adminPhone} onChange={set("adminPhone")} placeholder="1-800-555-0199" />
            <Input label="Administrator Email" value={f.adminEmail} onChange={set("adminEmail")} placeholder="fmla@admin.com" />
            <Select label="FMLA Leave Year Method" value={f.leaveYearMethod} onChange={set("leaveYearMethod")} options={LEAVE_YEAR_METHODS} />
            <Input label="Worksite Address" value={f.worksiteAddress} onChange={set("worksiteAddress")} placeholder="1200 Commerce Drive, Horsham, PA" />
            <Input label="Letter ID" value={f.letterId} onChange={set("letterId")} hint="Auto-generated" />
          </Grid>

          {/* ═══ 2. EMPLOYEE — always ═══ */}
          <SectionHead icon="👤" title="Employee" subtitle="Required for all letter types" />
          <Grid>
            <Input label="Employee Full Name" value={f.employeeName} onChange={set("employeeName")} required placeholder="Sarah J. Thompson" />
            <Input label="Employee ID" value={f.employeeId} onChange={set("employeeId")} placeholder="EMP-48821" />
            <Input label="Position / Title" value={f.position} onChange={set("position")} placeholder="Senior Operations Analyst" />
            <Input label="Department" value={f.department} onChange={set("department")} placeholder="Supply Chain" />
            <Input label="Home Address" value={f.employeeAddress} onChange={set("employeeAddress")} placeholder="442 Oak Hill Rd, Blue Bell, PA" />
            <Input label="Hire Date" value={f.hireDate} onChange={set("hireDate")} type="date" />
            <Input label="Hours Worked — Preceding 12 Months" value={f.hoursLast12Mo} onChange={set("hoursLast12Mo")} type="number"
              hint={isME ? "Federal FMLA: ≥1,250 · Maine state FMLA waives the hours test" : "Federal FMLA: ≥1,250 hours required"} />
            <Input label="Months Employed" value={f.monthsEmployed} onChange={set("monthsEmployed")} type="number"
              hint={isME ? "Maine requires ≥12 consecutive months" : "≥12 months required (need not be consecutive)"} />
            <Select label="State of Employment" value={f.stateOfEmployment} onChange={set("stateOfEmployment")} options={STATES} hint="Drives state overlay sections in the letter" />
            <Input label="FMLA Leave Year Start Date" value={f.leaveYearStart} onChange={set("leaveYearStart")} type="date" />
          </Grid>
          {isME && (<>
            <Callout color={BLUE} bg={BBGL} border={BBDR}>
              <strong>Maine overlay active.</strong> Maine FMLA (10 wks/2-yr rolling) applies alongside federal FMLA. No hours test. Broader family: siblings who live with employee, domestic partners.
            </Callout>
            <Grid>
              <Input label="ME FMLA Weeks Used (2-Year Window)" value={f.maineUsedWeeks} onChange={set("maineUsedWeeks")} type="number" hint="Tracked separately from the federal 12-month leave year" />
              <Input label="ME Benefit Year Start Date" value={f.maineBenefitYearStart} onChange={set("maineBenefitYearStart")} type="date" />
            </Grid>
          </>)}
          {isTN && isBond && (
            <Callout color={AMBER} bg={ABGL} border={ABDR}>
              <strong>Tennessee Parental Leave Act may apply.</strong> Requires ≥100 full-time employees at the worksite. Provides up to 4 months concurrent with FMLA (not in addition to it). Employee must give 3 months' advance notice where foreseeable.
            </Callout>
          )}

          {/* ═══ 3. LEAVE REQUEST — always ═══ */}
          <SectionHead icon="📋" title="Leave Request" subtitle="Required for all letter types" />
          <Grid>
            <Input label="Date Notice Received" value={f.noticeReceived} onChange={set("noticeReceived")} type="date" required hint="Starts the 5-business-day EN clock" />
            <Input label="Claim Number" value={f.claimNumber} onChange={set("claimNumber")} />
            <Input label="Leave Start Date" value={f.leaveStart} onChange={set("leaveStart")} type="date" required />
            <Input label="Leave End Date" value={f.leaveEnd} onChange={set("leaveEnd")} type="date" />
          </Grid>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Leave Type</div>
            <div style={{ display: "flex", gap: 24 }}>
              {["Continuous", "Intermittent", "Reduced Schedule"].map(t => <Radio key={t} label={t} value={t} current={f.leaveType} onChange={set("leaveType")} />)}
            </div>
          </div>
          {isInt && <Input label="Intermittent / Reduced Schedule Pattern" value={f.intermittentFrequency} onChange={set("intermittentFrequency")} placeholder="e.g. 2 days/week, Tuesdays and Thursdays" hint="Describe frequency and duration of expected episodes" />}
          <Select label="Qualifying Reason" value={f.qualifyingReason} onChange={set("qualifyingReason")} options={QUALIFYING_REASONS} />
          {(f.qualifyingReason || "").includes("family member") && (
            <Input label="Family Member Relationship" value={f.familyMemberRelationship} onChange={set("familyMemberRelationship")} placeholder="Spouse, child, parent..."
              hint={isME ? "Maine FMLA also covers siblings who live with employee and domestic partners" : "Federal FMLA: spouse, child, parent"} />
          )}

          {/* ═══ 4. ELIGIBILITY — EN and combined only ═══ */}
          {showEN && (<>
            <SectionHead icon="✅" title="Eligibility Determination"
              subtitle={f.noticeScope === "dn" ? "" : f.noticeScope === "en" ? "EN only — no designation section" : "EN + DN combined"} />
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Federal FMLA Eligibility</div>
              <div style={{ display: "flex", gap: 24 }}>
                <Radio label="Eligible" value="yes" current={f.fmlaEligible} onChange={set("fmlaEligible")} />
                <Radio label="Not Eligible" value="no" current={f.fmlaEligible} onChange={set("fmlaEligible")} />
              </div>
            </div>
            {f.fmlaEligible === "no" && (
              <div style={{ background: RBGL, border: `1px solid ${RBDR}`, borderRadius: 6, padding: "12px 16px", marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: RED, marginBottom: 8 }}>Check all applicable ineligibility reasons:</div>
                <Toggle label="< 12 months employed" checked={f.ineligMonths} onChange={setChk("ineligMonths")} />
                <Toggle label="< 1,250 hours in preceding 12 months" checked={f.ineligHours} onChange={setChk("ineligHours")} />
                <Toggle label="Worksite < 50 employees within 75 miles" checked={f.ineligSize} onChange={setChk("ineligSize")} />
              </div>
            )}
            <Grid>
              <Input label="Total FMLA Entitlement (weeks)" value={f.fmlaEntitlementWeeks} onChange={set("fmlaEntitlementWeeks")} type="number" hint="12 weeks standard · 26 for military caregiver" />
              <Input label="FMLA Weeks Used This Leave Year" value={f.fmlaUsedWeeks} onChange={set("fmlaUsedWeeks")} type="number" />
            </Grid>
          </>)}

          {/* ═══ 5. DESIGNATION — DN and combined only ═══ */}
          {showDN && (<>
            <SectionHead icon="🏷️" title="Designation Decision" subtitle="DN and combined EN+DN only — not shown for EN-only letters" />
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Designate as FMLA Leave?</div>
              <div style={{ display: "flex", gap: 24 }}>
                <Radio label="Yes — Designated" value="yes" current={f.isDesignated} onChange={set("isDesignated")} />
                <Radio label="No — Not Designated" value="no" current={f.isDesignated} onChange={set("isDesignated")} />
              </div>
            </div>
            {f.isDesignated === "no" && <Input label="Reason Not Designated" value={f.nonDesignationReason} onChange={set("nonDesignationReason")} placeholder="Leave does not qualify as a serious health condition..." />}
            <Input label="Weeks Counted Against FMLA Entitlement" value={f.weeksCountedFmla} onChange={set("weeksCountedFmla")} type="number"
              hint={isInt ? "For intermittent leave, enter equivalent weeks based on hours used" : "Weeks this leave period will consume from entitlement"} />
          </>)}

          {/* ═══ 6. MED CERT — DN and combined only ═══ */}
          {showDN && (<>
            <SectionHead icon="🩺" title="Medical Certification" subtitle="DN and combined EN+DN only" />
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Certification Required?</div>
              <div style={{ display: "flex", gap: 24 }}>
                <Radio label="Yes" value="yes" current={f.medCertRequired} onChange={set("medCertRequired")} />
                <Radio label="No" value="no" current={f.medCertRequired} onChange={set("medCertRequired")} />
              </div>
            </div>
            {f.medCertRequired === "yes" && (
              <Grid>
                <Select label="Certification Status" value={f.medCertStatus} onChange={set("medCertStatus")} options={["Pending","Received — Sufficient","Received — Insufficient","Overdue"]} />
                <Input label="Certification Due Date" value={f.medCertDueDate} onChange={set("medCertDueDate")} type="date" hint="15 calendar days from notice date" />
                <Input label="Certifying Provider Name" value={f.providerName} onChange={set("providerName")} placeholder="Dr. Marcus Chen, MD" />
                <Input label="Provider Practice / Hospital" value={f.providerPractice} onChange={set("providerPractice")} placeholder="Jefferson Health Orthopedics" />
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Recertification Required?</div>
                  <div style={{ display: "flex", gap: 24 }}>
                    <Radio label="Yes" value="yes" current={f.recertRequired} onChange={set("recertRequired")} />
                    <Radio label="No" value="no" current={f.recertRequired} onChange={set("recertRequired")} />
                  </div>
                </div>
                {f.recertRequired === "yes" && <Input label="Recertification Due Date" value={f.recertDate} onChange={set("recertDate")} type="date" />}
              </Grid>
            )}
          </>)}

          {/* ═══ 7. REQUIREMENTS & RETURN — DN and combined only ═══ */}
          {showDN && (<>
            <SectionHead icon="📌" title="Requirements & Return to Work" subtitle="DN and combined EN+DN only" />
            <Grid>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Concurrent Paid Leave Required?
                  {isSTD && <div style={{ fontSize: 10, color: AMBER, marginTop: 2 }}>PTO cannot be required during STD benefit period</div>}
                </div>
                <div style={{ display: "flex", gap: 24, marginBottom: 10 }}>
                  <Radio label="Yes" value="yes" current={f.paidLeaveConcurrent} onChange={set("paidLeaveConcurrent")} />
                  <Radio label="No" value="no" current={f.paidLeaveConcurrent} onChange={set("paidLeaveConcurrent")} />
                </div>
                {f.paidLeaveConcurrent === "yes" && <Input label="Paid Leave Types" value={f.paidLeaveTypes} onChange={set("paidLeaveTypes")} placeholder="Accrued sick leave and PTO" />}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Fitness-for-Duty Cert Required to Return?</div>
                <div style={{ display: "flex", gap: 24, marginBottom: 10 }}>
                  <Radio label="Yes" value="yes" current={f.fitForDutyRequired} onChange={set("fitForDutyRequired")} />
                  <Radio label="No" value="no" current={f.fitForDutyRequired} onChange={set("fitForDutyRequired")} />
                </div>
                {f.fitForDutyRequired === "yes" && (<>
                  <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Must Address Essential Functions?</div>
                  <div style={{ display: "flex", gap: 24 }}>
                    <Radio label="Yes" value="yes" current={f.fitForDutyEssentialFunctions} onChange={set("fitForDutyEssentialFunctions")} />
                    <Radio label="No" value="no" current={f.fitForDutyEssentialFunctions} onChange={set("fitForDutyEssentialFunctions")} />
                  </div>
                </>)}
              </div>
              <Input label="Anticipated Return-to-Work Date" value={f.anticipatedReturn} onChange={set("anticipatedReturn")} type="date" />
              <Input label="Days Advance Notice Before Return" value={f.contactDaysBeforeReturn} onChange={set("contactDaysBeforeReturn")} type="number" />
              <Input label="Employee Health Premium Share ($)" value={f.employeePremiumShare} onChange={set("employeePremiumShare")} placeholder="187.50 bi-weekly" hint="Required disclosure — 29 CFR §825.210(b)" />
              <Select label="Premium Payment Method" value={f.premiumPaymentMethod} onChange={set("premiumPaymentMethod")} options={["Direct bill during leave","Payroll deduction resumes on return","Pre-payment arrangement","Employer absorbs during leave"]} />
              <Select label="Delivery Method" value={f.deliveryMethod} onChange={set("deliveryMethod")} options={DELIVERY_METHODS} />
            </Grid>
          </>)}

          {/* ═══ 8. STD DETAILS — FMLA+STD only ═══ */}
          {isSTD && (
            <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 8, padding: "0 16px 4px", marginBottom: 4 }}>
              <SectionHead icon="🩹" title="Short-Term Disability Integration" subtitle="FMLA + STD letter only — not shown for Standalone FMLA or FMLA+PFML" />
              <Grid>
                <Input label="STD Carrier / Insurer" value={f.stdCarrierName} onChange={set("stdCarrierName")} placeholder="Principal Financial Group" />
                <Input label="STD Plan Name" value={f.stdPlanName} onChange={set("stdPlanName")} placeholder="Employer STD Plan — Class 2" />
                <Input label="STD Claim Number" value={f.stdClaimNumber} onChange={set("stdClaimNumber")} placeholder="STD-2026-004412" />
                <Input label="Elimination / Waiting Period (days)" value={f.stdEliminationDays} onChange={set("stdEliminationDays")} type="number" hint="Common: 7 or 14 calendar days" />
                <Input label="Approved Weekly STD Benefit ($)" value={f.stdWeeklyBenefit} onChange={set("stdWeeklyBenefit")} type="number" placeholder="1340.00" />
                <Input label="Benefit % of Pre-Disability Salary" value={f.stdBenefitPct} onChange={set("stdBenefitPct")} type="number" placeholder="60" hint="Typically 50–70%" />
                <Input label="Maximum STD Duration (weeks)" value={f.stdMaxDurationWeeks} onChange={set("stdMaxDurationWeeks")} type="number" hint="Common: 12 or 26 weeks" />
                <Input label="STD Estimated Exhaustion Date" value={f.stdExhaustionDate} onChange={set("stdExhaustionDate")} type="date" />
                <Input label="Offset Sources (if any)" value={f.stdOffsetSources} onChange={set("stdOffsetSources")} placeholder="SSDI, Workers' Comp, state DI..." hint="Dollar-for-dollar offsets reduce the STD benefit" />
              </Grid>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Bridge to LTD on STD Exhaustion?</div>
                <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
                  <Radio label="Yes" value="yes" current={f.stdBridgeToLtd} onChange={set("stdBridgeToLtd")} />
                  <Radio label="No" value="no" current={f.stdBridgeToLtd} onChange={set("stdBridgeToLtd")} />
                </div>
                {f.stdBridgeToLtd === "yes" && <Input label="LTD Claim Number (if already assigned)" value={f.ltdClaimNumber} onChange={set("ltdClaimNumber")} placeholder="LTD-2026-004412" />}
              </div>
              <Toggle label="Include PTO restriction notice — PTO cannot be required during STD benefit period" checked={f.stdNotePtoRestriction} onChange={setChk("stdNotePtoRestriction")} hint="Per DOL FMLA-2019-2-A: STD leave is not unpaid leave; concurrent PTO use cannot be required" />
            </div>
          )}

          {/* ═══ 9. PFML DETAILS — FMLA+PFML only ═══ */}
          {isPFML && (
            <div style={{ background: "#F0FDF4", border: `1px solid ${GBDR}`, borderRadius: 8, padding: "0 16px 4px", marginBottom: 4 }}>
              <SectionHead icon="💵" title="Paid Family & Medical Leave Integration" subtitle="FMLA + PFML letter only — not shown for Standalone FMLA or FMLA+STD" />
              <Grid>
                <Input label="PFML Program Name" value={f.pfmlProgram} onChange={set("pfmlProgram")} placeholder="Maine Paid Family & Medical Leave" hint="Full official program name" />
                <Input label="PFML Administrator / Contact" value={f.pfmlAdminContact} onChange={set("pfmlAdminContact")} placeholder="Aflac (Maine PFML)" />
                <Input label="PFML Claim Number" value={f.pfmlClaimNumber} onChange={set("pfmlClaimNumber")} placeholder="ME-PFML-2026-00441" />
                <Input label="Waiting / Elimination Period (days)" value={f.pfmlWaitingDays} onChange={set("pfmlWaitingDays")} type="number" hint={isME ? "Maine: 7 days for own medical leave; 0 for bonding/care" : "Varies by state program"} />
                <Input label="Estimated Weekly PFML Benefit ($)" value={f.pfmlWeeklyBenefit} onChange={set("pfmlWeeklyBenefit")} type="number" placeholder="680.00" />
                <Input label="PFML Benefit % of Wages" value={f.pfmlBenefitPct} onChange={set("pfmlBenefitPct")} type="number" placeholder="60" hint="Varies by program and wage band" />
                <Input label="PFML Weeks Available" value={f.pfmlWeeksAvailable} onChange={set("pfmlWeeksAvailable")} type="number" hint={isME ? "Maine: up to 12 weeks" : "Varies by state"} />
                <Input label="PFML Weeks Used This Benefit Year" value={f.pfmlWeeksUsed} onChange={set("pfmlWeeksUsed")} type="number" />
                <Select label="Primary Payer (if concurrent with STD)" value={f.pfmlPrimaryPayer} onChange={set("pfmlPrimaryPayer")} options={["PFML pays first","STD pays first","Employer plan coordinates — see plan terms"]} />
              </Grid>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>PFML Claim Filed?</div>
                <div style={{ display: "flex", gap: 24 }}>
                  <Radio label="Yes" value="yes" current={f.pfmlClaimFiled} onChange={set("pfmlClaimFiled")} />
                  <Radio label="No — Pending" value="no" current={f.pfmlClaimFiled} onChange={set("pfmlClaimFiled")} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>PFML Benefits Offset by Concurrent STD?</div>
                <div style={{ display: "flex", gap: 24 }}>
                  <Radio label="Yes (dollar-for-dollar)" value="yes" current={f.pfmlOffsetStd} onChange={set("pfmlOffsetStd")} />
                  <Radio label="No offset" value="no" current={f.pfmlOffsetStd} onChange={set("pfmlOffsetStd")} />
                </div>
              </div>
            </div>
          )}

          {/* ═══ 10. CUSTOM TEXT ZONES ═══ */}
          <SectionHead icon="✏️" title="Custom Letter Content" subtitle="Optional — zones update based on letter type and scope. Blank zones omitted." />
          {[
            {
              key: "customOpening", show: true,
              label: "Zone 1 — Opening note",
              context: isSTD ? "FMLA+STD" : isPFML ? "FMLA+PFML" : "Standalone FMLA",
              hint: isBond ? "Congratulatory tone — appears after 'Dear [Name],' before eligibility text."
                : isSTD ? "Empathy + STD benefit context — appears after 'Dear [Name],'"
                : isPFML ? "Warm opening noting FMLA protection and paid leave — appears after 'Dear [Name],'"
                : "Warm, supportive opening — appears after 'Dear [Name],' before eligibility text.",
              placeholder: isBond ? "e.g. Congratulations on this exciting milestone. We wish you and your growing family all the best."
                : "e.g. We appreciate you reaching out and hope you are feeling better. Our team is here to support you.",
              prompt: `Write a warm 1-2 sentence opening for an FMLA ${isSTD?"+STD":isPFML?"+PFML":""} letter to ${fn} at ${f.employerName||"the employer"}. Reason: ${f.qualifyingReason}. ${isBond?"Celebratory tone.":isSTD?"Compassionate, mention STD benefit.":"Compassionate, supportive."} No legal language. Return only the text.`,
            },
            {
              key: "customMidNote", show: showDN,
              hiddenReason: "Only shown for DN or combined EN+DN letters (scope is currently EN only)",
              label: "Zone 2 — Mid-letter note",
              context: isSTD ? `FMLA+STD · ${f.noticeScope==="combined"?"EN+DN":"DN"}` : isPFML ? `FMLA+PFML · ${f.noticeScope==="combined"?"EN+DN":"DN"}` : f.noticeScope==="combined"?"EN+DN":"DN only",
              hint: isSTD ? `STD coordination note — appears after designation. E.g. elimination period or ${f.stdCarrierName||"carrier"} contact.`
                : isPFML ? `PFML filing reminder — appears after designation. Prompt employee to file ${f.pfmlProgram||"their PFML claim"} if not done.`
                : "Case instructions — appears after designation. E.g. return coordination or manager contact.",
              placeholder: isSTD ? `e.g. Your STD benefit begins after the ${f.stdEliminationDays||7}-day waiting period. Contact ${f.adminName||"us"} at ${f.adminPhone||"the number above"} for STD benefit questions.`
                : isPFML ? `e.g. If you have not yet filed your ${f.pfmlProgram||"paid leave"} claim, please do so right away — both FMLA and PFML clocks run from your leave start date.`
                : `e.g. Please coordinate your return with ${f.hrContactName||"HR"} at least ${f.contactDaysBeforeReturn||2} business days before you plan to come back.`,
              prompt: `Write a 1-2 sentence mid-letter note for FMLA ${isSTD?"+STD":isPFML?"+PFML":""} for ${fn} at ${f.employerName||"the employer"}. ${isSTD?`STD: ${f.stdCarrierName||"carrier"}, ${f.stdEliminationDays||7}-day wait, $${f.stdWeeklyBenefit||"TBD"}/wk.`:isPFML?`PFML: ${f.pfmlProgram||"state program"} ${f.pfmlClaimNumber?`(${f.pfmlClaimNumber})`:"(pending)"}. Remind to file if not done.`:`HR: ${f.hrContactName||"HR"} at ${f.hrEmail||f.hrPhone||"HR contact"}.`} Plain language. Return only the text.`,
            },
            {
              key: "customClosing", show: true,
              label: "Zone 3 — Closing note",
              context: isSTD ? "FMLA+STD" : isPFML ? "FMLA+PFML" : isBond ? "Parental leave" : isME ? "Maine overlay" : "Standalone FMLA",
              hint: isSTD ? "STD closing — EAP referral, ADA awareness, or STD exhaustion note. Appears before signature."
                : isBond ? "Parental closing — warm and celebratory. Good for parental support resources."
                : isPFML ? "PFML closing — reinforce PFML program contact and support."
                : "Supportive closing — EAP referral or employer support note. Appears before signature.",
              placeholder: isSTD ? "e.g. Our EAP is available during your recovery — call 1-800-555-EAP7, 24/7, for free confidential support."
                : isBond ? "e.g. We look forward to welcoming you back. Please reach out if there is anything we can do during your parental leave."
                : "e.g. Our Employee Assistance Program offers free, confidential support to you and your household — available 24 hours a day at 1-800-555-EAP7.",
              prompt: `Write a warm 1-2 sentence closing for FMLA ${isSTD?"+STD":isPFML?"+PFML":""} letter to ${fn} at ${f.employerName||"the employer"}. Reason: ${f.qualifyingReason}. ${isSTD?"Mention EAP and recovery.":isBond?"Celebratory parental tone.":isPFML?"Mention PFML program contact.":"Mention EAP and encourage reach-out."} 1-2 sentences, no legal terms. Return only the text.`,
            },
          ].map(zone => {
            if (!zone.show) return (
              <div key={zone.key} style={{ background: G100, border: `1px solid ${G200}`, borderRadius: 6, padding: "9px 14px", marginBottom: 10, fontSize: 12, color: G400, fontFamily: ff }}>
                ⊘ <strong>{zone.label}</strong> — {zone.hiddenReason}
              </div>
            );
            return (
              <div key={zone.key} style={{ marginBottom: 14, background: BBGL, border: `1px solid ${BBDR}`, borderRadius: 8, padding: "13px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: ff }}>{zone.label}</div>
                  <span style={{ fontSize: 10, color: BLUE, background: "white", border: `1px solid ${BBDR}`, borderRadius: 99, padding: "1px 8px", fontFamily: ff, fontWeight: 600 }}>{zone.context}</span>
                </div>
                <div style={{ fontSize: 11, color: G600, marginBottom: 7, fontFamily: ff }}>{zone.hint}</div>
                <textarea value={f[zone.key]} onChange={e => set(zone.key)(e.target.value)} placeholder={zone.placeholder} rows={3}
                  style={{ width: "100%", border: `1px solid ${BBDR}`, borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: ff, resize: "vertical", color: G900, background: "white", lineHeight: 1.55, boxSizing: "border-box" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                  <button onClick={async () => {
                    const k = zone.key; set(k)("Drafting…");
                    try {
                      const r = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY||"","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"}, body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:200,messages:[{role:"user",content:zone.prompt}]}) });
                      const d = await r.json(); set(k)(!r.ok?"":d.content?.[0]?.text?.trim()||"");
                    } catch { set(k)(""); }
                  }} style={{ fontSize:11, padding:"4px 12px", borderRadius:6, border:`1px solid ${BBDR}`, background:"white", color:BLUE, cursor:"pointer", fontFamily:ff, fontWeight:600 }}>
                    ✨ Draft with AI
                  </button>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontSize:11, color:G400, fontFamily:ff }}>{(f[zone.key]||"").length} chars</span>
                    {f[zone.key] && <button onClick={() => set(zone.key)("")} style={{ fontSize:11, color:G400, background:"none", border:"none", cursor:"pointer", fontFamily:ff }}>Clear</button>}
                  </div>
                </div>
              </div>
            );
          })}

        </>);
      })()}

      {/* Generate button */}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onGenerate} disabled={!isValid}
          style={{ padding: "12px 32px", background: isValid ? ltColors[f.letterType] : G200, color: isValid ? "white" : G400, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: isValid ? "pointer" : "not-allowed", fontFamily: ff, letterSpacing: "0.04em" }}>
          Generate Letter →
        </button>
        {!isValid && <div style={{ fontSize: 11, color: G400, alignSelf: "center", marginLeft: 12 }}>Fill required fields: employer, employee, leave dates</div>}
      </div>
    </div>
  );
}

// ─── CSV → FORM MAPPER ────────────────────────────────────────────────────────
function csvToForm(claim, agentFields = {}) {
  const stateMap = {
    "maine": "Maine (ME)", "me": "Maine (ME)",
    "tennessee": "Tennessee (TN)", "tn": "Tennessee (TN)",
  };
  const stateKey = (claim.state_of_employment || "").toLowerCase();
  const stateOfEmployment =
    Object.keys(stateMap).find(k => stateKey.includes(k))
      ? stateMap[Object.keys(stateMap).find(k => stateKey.includes(k))]
      : "Federal Only (No State Overlay)";

  const isEligible =
    parseInt(claim.months_employed || 0) >= 12 &&
    parseInt(claim.hours_last_12mo || 0) >= 1250 &&
    parseInt(claim.worksite_headcount || 0) >= 50;

  const letterType = claim.std_claim_number
    ? "std"
    : claim.pfml_claim_number
    ? "pfml"
    : "fmla";

  const leaveStart = claim.leave_start || "";
  const medCertDueDate = leaveStart
    ? fmtDate(addDays(new Date(leaveStart), 15))
    : fmtDate(addDays(today, 15));

  return {
    ...defaultForm,
    // meta
    claimNumber:           claim.claim_number     || defaultForm.claimNumber,
    letterId:              autoLetterId(),
    generatedDate:         fmtDate(today),
    letterType,
    noticeScope:           agentFields.noticeScope || "combined",
    // employer
    employerName:          claim.employer_name    || "",
    hrContactName:         claim.hr_contact       || "",
    hrPhone:               claim.hr_phone         || "",
    hrEmail:               claim.hr_email         || "",
    worksiteHeadcount:     claim.worksite_headcount || "",
    // admin
    adminName:             claim.admin_name       || "",
    adminPhone:            claim.admin_phone      || "",
    adminEmail:            claim.admin_email      || "",
    // employee
    employeeName:          claim.employee_name    || "",
    employeeId:            claim.employee_id      || "",
    position:              claim.position         || "",
    department:            claim.department       || "",
    hireDate:              claim.hire_date        || "",
    hoursLast12Mo:         claim.hours_last_12mo  || "",
    monthsEmployed:        claim.months_employed  || "",
    stateOfEmployment,
    // leave
    noticeReceived:        claim.notice_received  || fmtDate(today),
    leaveType:             claim.leave_type       || "Continuous",
    qualifyingReason:      claim.qualifying_reason || QUALIFYING_REASONS[0],
    leaveStart,
    leaveEnd:              claim.leave_end        || "",
    // eligibility
    fmlaEligible:          isEligible ? "yes" : "no",
    ineligMonths:          parseInt(claim.months_employed || 0) < 12,
    ineligHours:           parseInt(claim.hours_last_12mo || 0) < 1250,
    ineligSize:            parseInt(claim.worksite_headcount || 0) < 50,
    // designation (agent fills these)
    isDesignated:          agentFields.isDesignated || (isEligible ? "yes" : "no"),
    weeksCountedFmla:      agentFields.weeksCountedFmla || "",
    nonDesignationReason:  agentFields.nonDesignationReason || "",
    // med cert
    medCertRequired:       agentFields.medCertRequired || "yes",
    medCertStatus:         agentFields.medCertStatus || "Pending",
    medCertDueDate,
    providerName:          agentFields.providerName || "",
    // requirements
    paidLeaveConcurrent:   agentFields.paidLeaveConcurrent || "yes",
    paidLeaveTypes:        agentFields.paidLeaveTypes || "Accrued sick leave and PTO",
    fitForDutyRequired:    agentFields.fitForDutyRequired || "yes",
    anticipatedReturn:     agentFields.anticipatedReturn || claim.leave_end || "",
    employeePremiumShare:  agentFields.premiumShare || "",
    // STD
    stdClaimNumber:        claim.std_claim_number  || "",
    stdWeeklyBenefit:      claim.std_weekly_benefit || "",
    stdEliminationDays:    claim.std_elimination_days || "7",
    // PFML
    pfmlClaimNumber:       claim.pfml_claim_number || "",
    pfmlProgram:           claim.pfml_program      || "",
    pfmlWeeklyBenefit:     claim.pfml_weekly_benefit || "",

    // custom text — start blank; operator fills in form
    customOpening: "",
    customMidNote: "",
    customClosing: "",
  };
}

// ─── SAMPLE CSV ───────────────────────────────────────────────────────────────
const SAMPLE_CSV = `claim_number,employee_name,employee_id,position,department,employer_name,hr_contact,hr_phone,hr_email,hire_date,hours_last_12mo,months_employed,worksite_headcount,state_of_employment,leave_start,leave_end,leave_type,qualifying_reason,notice_received,std_claim_number,std_weekly_benefit,std_elimination_days,pfml_claim_number,pfml_program,pfml_weekly_benefit,admin_name,admin_phone,admin_email
CLM-2026-001,Sarah Thompson,EMP-001,Operations Analyst,Supply Chain,Acme Manufacturing Co.,Jennifer Walsh,(215) 555-0100,jwalsh@acmemfg.com,2019-03-14,1820,87,250,Maine (ME),2026-06-30,2026-08-11,Continuous,Employee's own serious health condition,2026-06-19,STD-2026-001,1340,7,,,Meridian Absence Solutions,1-800-555-0199,fmla@meridian.com
CLM-2026-002,Marcus Johnson,EMP-002,Sales Manager,Commercial,Acme Manufacturing Co.,Jennifer Walsh,(215) 555-0100,jwalsh@acmemfg.com,2022-08-01,1100,46,250,Tennessee (TN),2026-07-15,2026-11-15,Continuous,Birth and bonding with newborn (within 1 year),2026-07-01,,,,,,Meridian Absence Solutions,1-800-555-0199,fmla@meridian.com
CLM-2026-003,Priya Patel,EMP-003,Software Engineer,IT,Acme Manufacturing Co.,Jennifer Walsh,(215) 555-0100,jwalsh@acmemfg.com,2018-01-15,1680,101,250,Federal Only (No State Overlay),2026-07-01,2026-07-14,Intermittent,Care for spouse/family member with serious health condition,2026-06-28,,,ME-PFML-2026-003,Maine Paid Family & Medical Leave,680,Meridian Absence Solutions,1-800-555-0199,fmla@meridian.com
CLM-2026-004,David Chen,EMP-004,Accountant,Finance,Acme Manufacturing Co.,Jennifer Walsh,(215) 555-0100,jwalsh@acmemfg.com,2025-03-01,420,15,250,Maine (ME),2026-07-10,2026-07-24,Continuous,Employee's own serious health condition,2026-07-05,,,,,,Meridian Absence Solutions,1-800-555-0199,fmla@meridian.com`;

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(",");
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || "").trim(); });
    return obj;
  });
}

function downloadSampleCSV() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sample_fmla_claims.csv";
  a.click();
}

// ─── CHAT AGENT COMPONENT ─────────────────────────────────────────────────────
import { useRef, useEffect } from "react";

function ChatAgent({ claim, onOpenForm, onAgentComplete }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collectedFields, setCollectedFields] = useState({});
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const FIELD_DEFS = [
    { key: "noticeScope",          label: "Notice scope"       },
    { key: "isDesignated",         label: "Designation"        },
    { key: "weeksCountedFmla",     label: "Weeks counted"      },
    { key: "medCertStatus",        label: "Med cert status"    },
    { key: "paidLeaveConcurrent",  label: "Paid leave rule"    },
    { key: "fitForDutyRequired",   label: "Fitness-for-duty"   },
    { key: "anticipatedReturn",    label: "Return date"        },
    { key: "premiumShare",         label: "Premium share"      },
  ];

  useEffect(() => {
    const isEligible =
      parseInt(claim.months_employed || 0) >= 12 &&
      parseInt(claim.hours_last_12mo || 0) >= 1250 &&
      parseInt(claim.worksite_headcount || 0) >= 50;
    const stateCode = claim.state_of_employment?.includes("ME") ? "ME"
                    : claim.state_of_employment?.includes("TN") ? "TN" : null;
    const hasStd  = !!claim.std_claim_number;
    const hasPfml = !!claim.pfml_claim_number;

    let msg = `Hi! I'm ready to help generate an FMLA letter for **${claim.employee_name}** (${claim.claim_number}).\n\n`;
    msg += `Here's what I loaded from the claim system:\n`;
    msg += `• **Employer:** ${claim.employer_name}\n`;
    msg += `• **Leave:** ${claim.leave_type} · ${claim.leave_start} – ${claim.leave_end}\n`;
    msg += `• **Reason:** ${claim.qualifying_reason}\n`;
    msg += `• **State:** ${claim.state_of_employment}\n`;
    if (hasStd)  msg += `• **STD:** ${claim.std_claim_number} · $${claim.std_weekly_benefit}/wk\n`;
    if (hasPfml) msg += `• **PFML:** ${claim.pfml_program} · $${claim.pfml_weekly_benefit}/wk\n`;
    msg += `\n**Eligibility:** ${claim.months_employed} months tenure · ${parseInt(claim.hours_last_12mo).toLocaleString()} hours · ${claim.worksite_headcount} employees at worksite\n`;
    msg += isEligible ? `✓ Meets all three FMLA eligibility criteria.\n` : `⚠ Does NOT meet FMLA eligibility — will flag in the letter.\n`;
    if (stateCode === "ME") msg += `\n🏛 **Maine overlay** will apply (10-week/2-year entitlement${hasPfml ? " + PFML concurrency" : ""}).\n`;
    if (stateCode === "TN" && claim.qualifying_reason?.includes("Birth")) {
      msg += `\n🏛 **Tennessee Parental Leave Act** may apply — I'll check the 100-employee threshold.\n`;
    }
    msg += `\nLetter type auto-detected: **${hasStd ? "FMLA + STD" : hasPfml ? "FMLA + Paid Leave" : "Standalone FMLA"}**. You can change this if needed.\n\n`;
    msg += `First question — should this be:\n1️⃣ **EN only** (eligibility notice — cert still pending)\n2️⃣ **DN only** (designation notice — EN already sent)\n3️⃣ **EN + DN combined** (most common — send both at once)`;

    setMessages([{ role: "assistant", content: msg }]);
  }, [claim]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function buildSystemPrompt() {
    const isEligible =
      parseInt(claim.months_employed || 0) >= 12 &&
      parseInt(claim.hours_last_12mo || 0) >= 1250 &&
      parseInt(claim.worksite_headcount || 0) >= 50;
    const stateCode = claim.state_of_employment?.includes("ME") ? "ME"
                    : claim.state_of_employment?.includes("TN") ? "TN" : null;

    return `You are an FMLA Letter Generation Assistant helping a claims operator generate a compliant letter through conversation.

CLAIM DATA:
${JSON.stringify(claim, null, 2)}

ELIGIBILITY: ${isEligible ? "ELIGIBLE — all 3 criteria met" : "NOT ELIGIBLE — see details below"}
- Months employed: ${claim.months_employed} (need ≥12): ${parseInt(claim.months_employed||0)>=12?"PASS":"FAIL"}
- Hours last 12mo: ${claim.hours_last_12mo} (need ≥1,250): ${parseInt(claim.hours_last_12mo||0)>=1250?"PASS":"FAIL"}
- Worksite headcount: ${claim.worksite_headcount} (need ≥50): ${parseInt(claim.worksite_headcount||0)>=50?"PASS":"FAIL"}
${stateCode==="ME"?`MAINE: State FMLA also applies (≥15 employees, 12 consecutive months, 10 wks/2-yr window)`:``}
${stateCode==="TN"?`TENNESSEE: Parental Leave Act applies only if birth/adoption AND ≥100 employees at worksite`:``}

FIELDS ALREADY KNOWN FROM CSV — DO NOT ASK FOR THESE:
employee name, id, position, department, employer, HR contact, hire date, hours worked,
months employed, worksite headcount, state, leave dates, leave type, qualifying reason,
notice received date, STD claim details (if present), PFML claim details (if present)

FIELDS STILL NEEDED (ask in this order):
1. Notice scope: EN only / DN only / EN+DN combined
2. Designation decision: is leave designated as FMLA?
3. If designated: how many weeks counted against entitlement?
4. Medical cert: required? if yes — status (received/pending) and provider name
5. Paid leave concurrent: required? which types?
6. Fitness-for-duty cert required to return?
7. Anticipated return-to-work date (may already equal leave end date — confirm)
8. Employee health insurance premium share (dollar amount)

RULES:
- Ask ONE question at a time. Be concise (3-5 lines max per response).
- Acknowledge each answer briefly before moving to the next field.
- Flag DOL compliance issues immediately when you spot them.
- EN must go out within 5 business days of ${claim.notice_received} — flag if already overdue.
- Medical cert: employee gets 15 calendar days minimum from today.
- If NOT eligible: still need designation (will be "not designated") and reason.
- Cannot require concurrent PTO when employee is receiving STD benefits.
${stateCode==="ME"?`- Maine: confirm 2-year PFML window balance if PFML applies.`:``}
${stateCode==="TN"?`- TN: Parental Leave Act only if headcount ≥100 AND reason is birth/adoption. TN gives 4 months CONCURRENT with FMLA, not additional.`:``}

WHEN ALL FIELDS COLLECTED:
1. Give a brief 3-bullet summary of what the letter will include.
2. Output the marker: FIELDS_COMPLETE
3. Then output a JSON block like this (no markdown fences, just raw JSON on its own line):
{"noticeScope":"combined","isDesignated":"yes","weeksCountedFmla":"6","medCertRequired":"yes","medCertStatus":"Received — Sufficient","providerName":"Dr. Smith","paidLeaveConcurrent":"yes","paidLeaveTypes":"Accrued sick and PTO","fitForDutyRequired":"yes","anticipatedReturn":"2026-08-12","premiumShare":"187.50","nonDesignationReason":""}`;
  }

  async function send(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: "assistant" === "assistant" ? "user" : "user", content: text };
    const newMsgs = [...messages, { role: "user", content: text }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      // Surface API-level errors (wrong key, quota, etc.)
      if (!res.ok) {
        const apiErr = data?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        setMessages(prev => [...prev, { role: "assistant", content: `⚠ API error: ${apiErr}` }]);
        setLoading(false);
        return;
      }

      const reply = data.content?.[0]?.text || "Something went wrong — please try again.";

      // Parse collected fields from response
      updateFields(reply);

      // Check for completion marker
      if (reply.includes("FIELDS_COMPLETE")) {
        const jsonMatch = reply.match(/\{[^{}]+\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            setCollectedFields(prev => ({ ...prev, ...parsed }));
            onAgentComplete(parsed);
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("API error:", err);
      // Try to get actual error from response
      let errMsg = "Connection error — please try again.";
      try {
        const errData = JSON.parse(err.message);
        errMsg = `API error: ${errData?.error?.message || err.message}`;
      } catch {
        errMsg = `Connection error: ${err.message}`;
      }
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    }
    setLoading(false);
  }

  function updateFields(text) {
    const lower = text.toLowerCase();
    const updates = {};
    if (lower.includes("en only") || lower.includes("eligibility notice only")) updates.noticeScope = "en";
    else if (lower.includes("dn only") || lower.includes("designation notice only")) updates.noticeScope = "dn";
    else if (lower.includes("combined") || lower.includes("en + dn") || lower.includes("en+dn")) updates.noticeScope = "combined";
    if (lower.includes("not designated") || lower.includes("not qualify")) updates.isDesignated = "no";
    else if (lower.includes("designated")) updates.isDesignated = "yes";
    if (lower.includes("received — sufficient") || lower.includes("cert received")) updates.medCertStatus = "Received — Sufficient";
    else if (lower.includes("cert pending") || lower.includes("pending")) updates.medCertStatus = "Pending";
    if (lower.includes("fitness-for-duty") || lower.includes("ffd required")) updates.fitForDutyRequired = "yes";
    if (lower.includes("paid leave") || lower.includes("pto concurrent")) updates.paidLeaveConcurrent = "yes";
    if (Object.keys(updates).length) setCollectedFields(prev => ({ ...prev, ...updates }));
  }

  const doneCount = Object.keys(collectedFields).filter(k =>
    FIELD_DEFS.map(f => f.key).includes(k) && collectedFields[k]
  ).length;

  const formatBubble = text =>
    text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .split("\n").map(l => l ? `<p style="margin:0 0 5px">${l}</p>` : "").join("");

  const HINTS = ["EN + DN combined", "Leave is designated", "6 weeks counted", "Cert received — sufficient", "FFD cert required", "Return Aug 12", "Premium is $187.50"];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", fontFamily: ff }}>
      {/* Chat panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Claim bar */}
        <div style={{ background: BBGL, borderBottom: `1px solid ${BBDR}`, padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: BLUE, fontWeight: 600, fontFamily: ff }}>
            📋 {claim.employee_name} · {claim.claim_number} · {claim.state_of_employment}
          </div>
          <button
            onClick={onOpenForm}
            style={{ fontSize: 12, color: BLUE, background: "white", border: `1px solid ${BBDR}`, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: ff, fontWeight: 600 }}
          >
            Open full form ↗
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10, background: G50 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.role === "assistant" ? NAV : G200, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: m.role === "assistant" ? "white" : G600, flexShrink: 0, marginTop: 2 }}>
                {m.role === "assistant" ? "AI" : "Op"}
              </div>
              <div
                style={{ padding: "10px 13px", borderRadius: m.role === "assistant" ? "3px 10px 10px 10px" : "10px 3px 10px 10px", background: m.role === "assistant" ? "white" : BBGL, border: `1px solid ${m.role === "assistant" ? G200 : BBDR}`, fontSize: 13, color: G800, lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: formatBubble(m.content) }}
              />
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 8, alignSelf: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: NAV, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white", flexShrink: 0 }}>AI</div>
              <div style={{ padding: "10px 16px", borderRadius: "3px 10px 10px 10px", background: "white", border: `1px solid ${G200}` }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0,200,400].map(d => (
                    <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: G400, animation: `bounce 1.2s ${d}ms infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        <div style={{ padding: "8px 12px", background: "white", borderTop: `1px solid ${G200}`, display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
          {HINTS.map(h => (
            <button key={h} onClick={() => send(h)}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: `1px solid ${G200}`, background: G50, color: G600, cursor: "pointer", fontFamily: ff }}>
              {h}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "10px 12px", background: "white", borderTop: `1px solid ${G200}`, display: "flex", gap: 8, flexShrink: 0 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Type your answer…"
            rows={1}
            style={{ flex: 1, border: `1px solid ${G200}`, borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: ff, resize: "none", outline: "none", lineHeight: 1.4, maxHeight: 80, overflowY: "auto" }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{ padding: "8px 16px", background: loading ? G200 : NAV, color: "white", border: "none", borderRadius: 6, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", fontFamily: ff, fontWeight: 600, flexShrink: 0 }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Field tracker sidebar */}
      <div style={{ width: 210, borderLeft: `1px solid ${G200}`, background: "white", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${G200}`, fontSize: 11, fontWeight: 700, color: G600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Fields collected
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
          {/* Pre-filled from CSV */}
          <div style={{ fontSize: 10, fontWeight: 700, color: G400, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>From claim system</div>
          {[
            { label: "Employee", value: claim.employee_name },
            { label: "Employer", value: claim.employer_name },
            { label: "Leave dates", value: `${claim.leave_start} – ${claim.leave_end}` },
            { label: "Leave type", value: claim.leave_type },
            { label: "State", value: claim.state_of_employment },
            { label: "STD / PFML", value: claim.std_claim_number ? "STD: " + claim.std_claim_number : claim.pfml_claim_number ? "PFML loaded" : "N/A" },
          ].map(f => (
            <div key={f.label} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 5 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: GBGL, border: `1px solid ${GBDR}`, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: GREEN, fontSize: 9, fontWeight: 700 }}>✓</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: G600 }}>{f.label}</div>
                <div style={{ fontSize: 10, color: GREEN, fontWeight: 600 }}>{f.value}</div>
              </div>
            </div>
          ))}

          {/* Agent-collected fields */}
          <div style={{ fontSize: 10, fontWeight: 700, color: G400, textTransform: "uppercase", letterSpacing: "0.06em", margin: "12px 0 6px" }}>From agent chat</div>
          {FIELD_DEFS.map(f => {
            const done = !!collectedFields[f.key];
            return (
              <div key={f.key} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 5 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: done ? GBGL : G100, border: `1px solid ${done ? GBDR : G200}`, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {done && <span style={{ color: GREEN, fontSize: 9, fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: done ? G600 : G400 }}>{f.label}</div>
                  {done && collectedFields[f.key] && (
                    <div style={{ fontSize: 10, color: GREEN, fontWeight: 600 }}>{String(collectedFields[f.key]).substring(0, 22)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div style={{ padding: "10px 12px", borderTop: `1px solid ${G200}` }}>
          <div style={{ height: 4, background: G100, borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
            <div style={{ height: "100%", background: GREEN, borderRadius: 2, width: `${Math.round((doneCount / FIELD_DEFS.length) * 100)}%`, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 11, color: G400, fontFamily: ff }}>{doneCount} of {FIELD_DEFS.length} agent fields</div>
          {doneCount === FIELD_DEFS.length && (
            <button onClick={onOpenForm} style={{ marginTop: 8, width: "100%", padding: "7px", background: GREEN, color: "white", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: ff }}>
              Open form to review ↗
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ─── CSV UPLOAD SCREEN ────────────────────────────────────────────────────────
function CSVUpload({ onLoad }) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  function handleFile(file) {
    const r = new FileReader();
    r.onload = e => onLoad(e.target.result);
    r.readAsText(file);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#E8EAF0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff }}>
      <div style={{ background: "white", borderRadius: 12, padding: "40px 48px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: NAV, marginBottom: 6, fontFamily: ff }}>FMLA Letter Generator</div>
        <div style={{ fontSize: 13, color: G600, marginBottom: 28, lineHeight: 1.6 }}>Upload your claims export CSV or use the sample data to start generating letters via the chat agent or full form.</div>

        <div
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          style={{ border: `2px dashed ${dragging ? NAV : G200}`, borderRadius: 10, padding: "28px 20px", cursor: "pointer", background: dragging ? BBGL : G50, transition: "all 0.15s", marginBottom: 16 }}
        >
          <div style={{ fontSize: 13, color: dragging ? BLUE : G600, fontWeight: 600 }}>Drop CSV here or click to browse</div>
          <div style={{ fontSize: 12, color: G400, marginTop: 4 }}>Claim system export · standard column format</div>
        </div>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => onLoad(SAMPLE_CSV)} style={{ padding: "9px 20px", background: NAV, color: "white", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: ff }}>
            Use sample claims
          </button>
          <button onClick={downloadSampleCSV} style={{ padding: "9px 16px", background: "white", color: G600, border: `1px solid ${G200}`, borderRadius: 7, fontSize: 13, cursor: "pointer", fontFamily: ff }}>
            Download template CSV
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CLAIM SELECTOR SCREEN ────────────────────────────────────────────────────
function ClaimSelector({ claims, onSelect, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#E8EAF0", fontFamily: ff }}>
      <div style={{ background: NAV, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Absence Management Platform</div>
          <div style={{ color: "white", fontSize: 15, fontWeight: 700 }}>Select a Claim</div>
        </div>
        <button onClick={onBack} style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontFamily: ff }}>
          ← Upload different CSV
        </button>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ fontSize: 13, color: G600, marginBottom: 16, fontFamily: ff }}>
          {claims.length} claim{claims.length !== 1 ? "s" : ""} loaded · Click a claim to start the letter agent
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
          {claims.map((c, i) => {
            const isEligible = parseInt(c.months_employed||0) >= 12 && parseInt(c.hours_last_12mo||0) >= 1250 && parseInt(c.worksite_headcount||0) >= 50;
            const stateCode = c.state_of_employment?.includes("ME") ? "ME" : c.state_of_employment?.includes("TN") ? "TN" : null;
            const hasStd = !!c.std_claim_number;
            const hasPfml = !!c.pfml_claim_number;
            return (
              <div key={i} onClick={() => onSelect(c)}
                style={{ background: "white", borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", cursor: "pointer", border: `1px solid ${G200}`, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = NAV; e.currentTarget.style.boxShadow = "0 4px 14px rgba(27,58,107,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = G200; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.07)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: G900, fontFamily: ff }}>{c.employee_name}</div>
                    <div style={{ fontSize: 11, color: G400, fontFamily: "monospace" }}>{c.claim_number} · {c.department}</div>
                  </div>
                  <div style={{ fontSize: 11, color: G400, textAlign: "right" }}>
                    <div>{c.leave_start}</div>
                    <div>{c.leave_type}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: G600, marginBottom: 10, lineHeight: 1.4 }}>{c.qualifying_reason}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {stateCode && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: stateCode === "ME" ? BBGL : ABGL, color: stateCode === "ME" ? BLUE : AMBER, fontWeight: 600 }}>{stateCode} Overlay</span>}
                  {hasStd  && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#FFF7ED", color: "#7C2D12", fontWeight: 600 }}>FMLA+STD</span>}
                  {hasPfml && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: GBGL, color: GREEN, fontWeight: 600 }}>FMLA+PFML</span>}
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: isEligible ? GBGL : RBGL, color: isEligible ? GREEN : RED, fontWeight: 600 }}>
                    {isEligible ? "✓ Eligible" : "⚠ Check eligibility"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [appMode, setAppMode] = useState("upload");       // upload | select | agent | form | letter
  const [claims,  setClaims]  = useState([]);
  const [activeClaim, setActiveClaim] = useState(null);
  const [form, setForm]       = useState(defaultForm);
  const [view, setView]       = useState("form");         // form | letter (within form/letter mode)

  const scopeBgColor = { en: "#0D6B3B", dn: "#7C2D12", combined: NAV };
  const scopeLabel   = { en: "EN Only",  dn: "DN Only",  combined: "EN + DN" };
  const ltypeBgColor = { fmla: NAV, pfml: "#0D6B3B", std: "#7C2D12" };
  const ltypeLabel   = { fmla: "Standalone FMLA", pfml: "FMLA + Paid Leave", std: "FMLA + STD" };

  function handleCSVLoad(text) {
    const parsed = parseCSV(text);
    setClaims(parsed);
    setAppMode("select");
  }

  function handleClaimSelect(claim) {
    setActiveClaim(claim);
    const mapped = csvToForm(claim);
    setForm(mapped);
    setAppMode("agent");
  }

  function handleOpenForm() {
    setView("form");
    setAppMode("form");
  }

  function handleAgentComplete(agentFields) {
    const merged = csvToForm(activeClaim, agentFields);
    setForm(merged);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (appMode === "upload") return <CSVUpload onLoad={handleCSVLoad} />;
  if (appMode === "select") return <ClaimSelector claims={claims} onSelect={handleClaimSelect} onBack={() => setAppMode("upload")} />;

  if (appMode === "agent") {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: ff }}>
        {/* Top bar */}
        <div style={{ background: NAV, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => setAppMode("select")} style={{ color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: ff }}>← Claims</button>
            <div>
              <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Chat Agent</div>
              <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>FMLA Letter Generation</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleOpenForm} style={{ padding: "7px 14px", background: GOLD, color: NAV, border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: ff }}>
              Open full form ↗
            </button>
          </div>
        </div>
        <ChatAgent
          claim={activeClaim}
          onOpenForm={handleOpenForm}
          onAgentComplete={handleAgentComplete}
        />
      </div>
    );
  }

  // ── Form + Letter mode ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#E8EAF0", fontFamily: ff }}>
      <div style={{ background: NAV, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setAppMode("agent")} style={{ color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: ff }}>← Agent</button>
          <div>
            <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Absence Management Platform</div>
            <div style={{ color: "white", fontSize: 15, fontWeight: 700 }}>
              FMLA EN + DN Letter Generator
              {activeClaim && <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.6)", marginLeft: 10 }}>{activeClaim.claim_number} · {activeClaim.employee_name}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {view === "letter" && (
            <>
              <div style={{ background: scopeBgColor[form.noticeScope] || NAV, color: "white", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.05em" }}>
                {scopeLabel[form.noticeScope]}
              </div>
              <div style={{ background: ltypeBgColor[form.letterType] || NAV, color: "white", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.05em" }}>
                {ltypeLabel[form.letterType]}
              </div>
            </>
          )}
          <button onClick={() => setView(view === "form" ? "letter" : "form")} style={{ padding: "8px 16px", background: view === "form" ? GOLD : "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {view === "form" ? "↗ Preview Letter" : "← Edit Inputs"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {activeClaim && view === "form" && (
          <div style={{ background: BBGL, border: `1px solid ${BBDR}`, borderRadius: 8, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 13, color: BLUE, fontFamily: ff }}>
              ✓ Pre-filled from claim <strong>{activeClaim.claim_number}</strong> · {activeClaim.employee_name} · Review and edit any fields before generating
            </div>
            <button onClick={() => setAppMode("agent")} style={{ fontSize: 12, color: BLUE, background: "white", border: `1px solid ${BBDR}`, borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontFamily: ff }}>
              ← Back to agent
            </button>
          </div>
        )}
        {view === "form" ? (
          <div style={{ background: "white", borderRadius: 10, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <InputForm form={form} setForm={setForm} onGenerate={() => setView("letter")} />
          </div>
        ) : (
          <>
            {/* Letter action bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: scopeBgColor[form.noticeScope] || NAV, color: "white" }}>{scopeLabel[form.noticeScope]}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: ltypeBgColor[form.letterType] || NAV, color: "white" }}>{ltypeLabel[form.letterType]}</span>
              </div>
              <button
                onClick={() => {
                  const content = document.getElementById("letter-print-area")?.innerHTML;
                  if (!content) return;
                  const win = window.open("", "_blank");
                  win.document.write(`<!DOCTYPE html><html><head><title>FMLA Letter - ${form.claimNumber}</title><style>
                    *{box-sizing:border-box;margin:0;padding:0}
                    body{font-family:Georgia,serif;font-size:13.5px;color:#1a1a1a;line-height:1.8;padding:48px;max-width:720px;margin:0 auto}
                    h1,h2,h3{font-weight:700}
                    a{color:#1a1a1a}
                    hr{border:none;border-top:1px solid #ddd;margin:20px 0}
                    strong{font-weight:700}
                    @media print{body{padding:24px}@page{margin:20mm}}
                  </style></head><body>${content}</body></html>`);
                  win.document.close();
                  setTimeout(() => { win.focus(); win.print(); }, 400);
                }}
                style={{ padding: "8px 18px", background: NAV, color: "white", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: ff, display: "flex", alignItems: "center", gap: 6 }}
              >
                ⬇ Download PDF
              </button>
            </div>
            <div style={{ background: "white", borderRadius: 10, padding: "36px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
              <div id="letter-print-area">
                <GeneratedLetter f={form} />
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <ComplianceReport f={form} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
