// EsrForm.jsx — ESR Verification Form container.
//
// This page intentionally does NOT use the app's Navbar/sidebar chrome —
// it recreates the dedicated design handoff's own header/layout pixel-close
// (design_handoff_esr_verification_form/ESR Verification Form.dc.html),
// which is a different visual system from the rest of today's dashboard.

import { useState } from "react";
import { Link } from "react-router-dom";

import EsrDetectionSection from "./EsrDetectionSection";
import EsrVerificationSection from "./EsrVerificationSection";
import EsrAssessmentSection from "./EsrAssessmentSection";
import EsrResponseSection from "./EsrResponseSection";
import EsrReportGenerationSection from "./EsrReportGenerationSection";
import { esrStyles } from "./esrStyles";
import { submitEsrReport } from "../../services/api";

const DRAFT_KEY = "esr_form_draft";

const EMPTY_LAB_ROW = { source: "", specimenType: "", examinationType: "", etiologicAgent: "", tested: "", positive: "", negative: "" };

const ASSISTANCE_CATEGORIES = [
  "Technical support for surveillance",
  "Human resource",
  "Medicines/Medical supplies",
  "Laboratory supplies/logistics",
  "Health promotion materials",
  "Field/Epidemiologic investigation",
  "Others",
];

const RESPONSE_CATEGORIES = [
  "Case management",
  "Laboratory confirmation",
  "Field/Epidemiologic investigation*",
  "Program management/counter measures",
  "Health education and promotion",
  "Response coordination mechanism",
  "Others",
];

function emptySignature() {
  return { signature: "", name: "", designation: "" };
}

function initialFormState() {
  return {
    verificationReport: false,
    followUpReportNo: "",
    code: "",
    detection: {
      dateDetected: "",
      timeDetected: "",
      sourceOfInformation: { chdResu: false, lgu: false, dohEb: false, rLesu: false, internetMedia: false, others: false },
      sourceOfInformationText: { internetMedia: "", others: "" },
    },
    filterVerification: {
      dateOfVerification: "",
      timeOfVerification: "",
      typeOfHealthEvent: { suspect: false, confirmed: false, clustering: false, increasing: false, outbreak: false, others: false },
      typeOfHealthEventText: { others: "" },
      outbreakDeclared: "",
      declaredBy: { lgu: false, chdResu: false, dohEb: false, others: false },
      declaredByText: { others: "" },
      lguValidatedByResu: "",
      dateOfDeclaration: "",
      description: {
        titleOfHealthEvent: "",
        location: { region: "", province: "", municipality: "", barangay: "", facility: "" },
        startDate: "",
        latestOnset: "",
        cases: { initialPrevious: "", added: false, subtracted: false, total: "" },
        deaths: { initialPrevious: "", added: false, subtracted: false, total: "" },
      },
      healthStatus: { admitted: "", rhuOpdConsulted: "", noConsultation: "", forVerification: "" },
      profileOfCases: { sex: { male: false, female: false, unknown: false }, ageRange: { min: "", max: "", median: "" } },
      profileOfDeaths: { sex: { male: false, female: false, unknown: false }, ageRange: { min: "", max: "", median: "" } },
      summary: "",
      outcome: { active: "", recovered: "", died: "", forVerification: "" },
      laboratoryDetails: { procedureDone: "", rows: [{ ...EMPTY_LAB_ROW }, { ...EMPTY_LAB_ROW }, { ...EMPTY_LAB_ROW }] },
    },
    assessment: {
      status: { status: "", dateClosed: "" },
      levelOfConcern: { PHELC: {}, PHERC: {}, PHENC: {}, PHEIC: {} },
      assistanceNeeded: ASSISTANCE_CATEGORIES.map((category) => ({ category, yesNo: "", details: "", remarks: "" })),
    },
    response: RESPONSE_CATEGORIES.map((category) => ({ category, officeAgency: "", actions: "", dateStarted: "", status: "" })),
    esuLevel: { mesu: false, cesu: false, pesu: false, resu: false, eb: false },
    reportGeneration: {
      sourcesOfInformation: "",
      whoInformed: "",
      preparedBy: emptySignature(),
      reviewedBy: emptySignature(),
      approvedBy: emptySignature(),
    },
  };
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...initialFormState(), ...JSON.parse(raw) } : initialFormState();
  } catch {
    return initialFormState();
  }
}

function validateForm(state) {
  if (!state.detection.dateDetected) return "Date detected is required.";
  if (!Object.values(state.detection.sourceOfInformation).some(Boolean)) {
    return "Select at least one source of information.";
  }
  if (!state.filterVerification.dateOfVerification) return "Date of verification is required.";
  if (!Object.values(state.filterVerification.typeOfHealthEvent).some(Boolean)) {
    return "Select at least one type of health event.";
  }
  const { titleOfHealthEvent, location } = state.filterVerification.description;
  if (!titleOfHealthEvent) return "Title of health event is required.";
  if (!location.region || !location.province || !location.municipality || !location.barangay) {
    return "Region, Province, Municipality, and Barangay are all required.";
  }
  return "";
}

// Converts the JS (camelCase) form state into the snake_case payload the
// backend's Pydantic model expects. Checkbox-group/free-form dicts (e.g.
// sourceOfInformation, levelOfConcern criteria text) pass through as-is —
// those keys are opaque to the schema (typed as Dict[str, bool]), only the
// structural field names below need renaming.
function buildPayload(state) {
  const fv = state.filterVerification;
  return {
    verification_report: state.verificationReport,
    follow_up_report_no: state.followUpReportNo,
    code: state.code,
    detection: {
      date_detected: state.detection.dateDetected,
      time_detected: state.detection.timeDetected,
      source_of_information: state.detection.sourceOfInformation,
      source_of_information_text: state.detection.sourceOfInformationText,
    },
    filter_verification: {
      date_of_verification: fv.dateOfVerification,
      time_of_verification: fv.timeOfVerification,
      type_of_health_event: fv.typeOfHealthEvent,
      type_of_health_event_text: fv.typeOfHealthEventText,
      outbreak_declared: fv.outbreakDeclared || null,
      declared_by: fv.declaredBy,
      declared_by_text: fv.declaredByText,
      lgu_validated_by_resu: fv.lguValidatedByResu || null,
      date_of_declaration: fv.dateOfDeclaration,
      description: {
        title_of_health_event: fv.description.titleOfHealthEvent,
        location: fv.description.location,
        start_date: fv.description.startDate,
        latest_onset: fv.description.latestOnset,
        cases: {
          initial_previous: fv.description.cases.initialPrevious,
          added: fv.description.cases.added,
          subtracted: fv.description.cases.subtracted,
          total: fv.description.cases.total,
        },
        deaths: {
          initial_previous: fv.description.deaths.initialPrevious,
          added: fv.description.deaths.added,
          subtracted: fv.description.deaths.subtracted,
          total: fv.description.deaths.total,
        },
      },
      health_status: fv.healthStatus,
      profile_of_cases: {
        sex: fv.profileOfCases.sex,
        age_range: fv.profileOfCases.ageRange,
      },
      profile_of_deaths: {
        sex: fv.profileOfDeaths.sex,
        age_range: fv.profileOfDeaths.ageRange,
      },
      summary: fv.summary,
      outcome: fv.outcome,
      laboratory_details: {
        procedure_done: fv.laboratoryDetails.procedureDone || null,
        rows: fv.laboratoryDetails.rows.map((r) => ({
          source: r.source,
          specimen_type: r.specimenType,
          examination_type: r.examinationType,
          etiologic_agent: r.etiologicAgent,
          tested: r.tested,
          positive: r.positive,
          negative: r.negative,
        })),
      },
    },
    assessment: {
      status: {
        status: state.assessment.status.status || null,
        date_closed: state.assessment.status.dateClosed,
      },
      level_of_concern: state.assessment.levelOfConcern,
      assistance_needed: state.assessment.assistanceNeeded.map((row) => ({
        category: row.category,
        yes_no: row.yesNo || null,
        details: row.details,
        remarks: row.remarks,
      })),
    },
    response: state.response.map((row) => ({
      category: row.category,
      office_agency: row.officeAgency,
      actions: row.actions,
      date_started: row.dateStarted,
      status: row.status || null,
    })),
    esu_level: state.esuLevel,
    report_generation: {
      sources_of_information: state.reportGeneration.sourcesOfInformation,
      who_informed: state.reportGeneration.whoInformed,
      prepared_by: state.reportGeneration.preparedBy,
      reviewed_by: state.reportGeneration.reviewedBy,
      approved_by: state.reportGeneration.approvedBy,
    },
  };
}

function errMsg(err, fallback) {
  return err?.response?.data?.detail || fallback;
}

export default function EsrForm() {
  const [form, setForm] = useState(loadDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const update = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSaveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    setError("");
    setInfo("Draft saved on this device.");
  };

  const handleSubmit = async () => {
    const problem = validateForm(form);
    if (problem) {
      setError(problem);
      setInfo("");
      return;
    }
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const result = await submitEsrReport(buildPayload(form));
      localStorage.removeItem(DRAFT_KEY);
      setInfo(
        result.sheet_synced
          ? "Report submitted and added to the line list."
          : "Report submitted and saved. It will be added to the line list shortly (Sheets sync is retried separately)."
      );
    } catch (err) {
      setError(errMsg(err, "Could not submit the report. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={esrStyles.page}>
      <header style={esrStyles.header}>
        <div style={esrStyles.headerLeft}>
          <div style={esrStyles.logoSlot} />
          <div style={esrStyles.headerTextCol}>
            <span style={esrStyles.headerEyebrow}>PHRIC · Epidemiology Surveillance</span>
            <span style={esrStyles.headerTitle}>ESR Verification Form</span>
          </div>
        </div>
        <Link to="/home" style={esrStyles.headerLink}>← Back to Epidemiology Surveillance</Link>
      </header>

      <div style={esrStyles.content}>
        <section style={esrStyles.identityCard}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
            <div style={{ minWidth: "340px" }}>
              <div style={{ fontSize: "12px", color: "#a3835f", fontWeight: 600, letterSpacing: ".3px", marginBottom: "10px" }}>
                DOH-EB-AEHMD-QMOP-03-Form2 Rev.6
              </div>
              <div style={{ fontFamily: "'Poppins'", fontWeight: 700, fontSize: "22px", color: "#111826" }}>Epidemiology Bureau</div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#1f2733", marginTop: "2px" }}>
                Event-based Surveillance and Response (ESR)
              </div>
              <div style={{ fontSize: "13.5px", color: "#5b6472", marginTop: "6px" }}>
                Tel: (02) 651-7800 loc 2929 · esr.central2@gmail.com
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 150px", alignItems: "center", gap: "14px 12px", minWidth: "320px" }}>
              <span style={esrStyles.fieldLabel}>Verification report</span>
              <input
                type="checkbox"
                style={{ justifySelf: "start" }}
                checked={form.verificationReport}
                onChange={(e) => update("verificationReport")(e.target.checked)}
              />
              <span style={esrStyles.fieldLabel}>Follow-up report no.</span>
              <input style={{ ...esrStyles.ulInput, width: "150px" }} value={form.followUpReportNo} onChange={(e) => update("followUpReportNo")(e.target.value)} />
              <span style={esrStyles.fieldLabel}>Code (yyyy-mm-no)</span>
              <input style={{ ...esrStyles.ulInput, width: "150px" }} placeholder="yyyy-mm-no" value={form.code} onChange={(e) => update("code")(e.target.value)} />
            </div>
          </div>
          <div style={esrStyles.disclaimer}>
            This document is distributed only to limited number of DOH, CHD and concerned agency staff for information
            of events which may have national/international implications. <br />Please observe responsible information sharing.
          </div>
        </section>

        <EsrDetectionSection value={form.detection} onChange={update("detection")} />
        <EsrVerificationSection value={form.filterVerification} onChange={update("filterVerification")} />
        <EsrAssessmentSection value={form.assessment} onChange={update("assessment")} />
        <EsrResponseSection
          value={form.response}
          onChange={update("response")}
          esuLevel={form.esuLevel}
          onEsuLevelChange={update("esuLevel")}
        />
        <EsrReportGenerationSection value={form.reportGeneration} onChange={update("reportGeneration")} />

        <div style={esrStyles.footer}>
          <div>Public Health Event of Local (L), Regional (R), National (N) Concern</div>
          <div>Public Health Emergency of International Concern (PHEIC); according to WHO-International Health Regulation Definition</div>
          <div style={esrStyles.footerDisclaimer}>
            DISCLAIMER: Information indicated in this report may change upon further validation or investigation made
            by the epidemiology and surveillance units and other concerned agencies.
          </div>
        </div>

        {error && <p style={{ ...esrStyles.banner, ...esrStyles.errorBanner }}>{error}</p>}
        {info && <p style={{ ...esrStyles.banner, ...esrStyles.infoBanner }}>{info}</p>}

        <div style={esrStyles.actionsRow}>
          <button type="button" style={{ ...esrStyles.buttonBase, ...esrStyles.buttonSecondary }} onClick={handleSaveDraft} disabled={busy}>
            Save Draft
          </button>
          <button type="button" style={{ ...esrStyles.buttonBase, ...esrStyles.buttonPrimary }} onClick={handleSubmit} disabled={busy}>
            {busy ? "Submitting…" : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
