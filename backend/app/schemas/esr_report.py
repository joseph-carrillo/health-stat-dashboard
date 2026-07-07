# esr_report.py
# Request schema for POST /api/esr-reports.
#
# This is the first Pydantic model in this codebase — everywhere else takes
# raw dicts via Body(). The ESR Verification Form has 40+ nested fields
# (checkbox groups, dynamic table rows), so hand-validating it as a dict
# would be error-prone; FastAPI already bundles Pydantic, so this adds no
# new dependency.
#
# Checkbox-group sections (source of information, type of health event,
# level-of-concern criteria, etc.) are typed as Dict[str, bool] rather than
# one field per literal option label — those labels are verbatim form copy
# that lives in the frontend, not something this schema should hardcode.

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class Location(BaseModel):
    region: Optional[str] = None
    province: Optional[str] = None
    municipality: Optional[str] = None
    barangay: Optional[str] = None
    facility: Optional[str] = None


class CaseOrDeathCount(BaseModel):
    initial_previous: Optional[str] = None
    added: bool = False
    subtracted: bool = False
    total: Optional[str] = None


class SexBreakdown(BaseModel):
    male: bool = False
    female: bool = False
    unknown: bool = False


class AgeRange(BaseModel):
    min: Optional[str] = None
    max: Optional[str] = None
    median: Optional[str] = None


class ProfileBlock(BaseModel):
    sex: SexBreakdown = Field(default_factory=SexBreakdown)
    age_range: AgeRange = Field(default_factory=AgeRange)


class LaboratoryRow(BaseModel):
    source: Optional[str] = None
    specimen_type: Optional[str] = None
    examination_type: Optional[str] = None
    etiologic_agent: Optional[str] = None
    tested: Optional[str] = None
    positive: Optional[str] = None
    negative: Optional[str] = None


class LaboratoryDetails(BaseModel):
    procedure_done: Optional[str] = None  # "yes" | "no" | "for_verification"
    rows: List[LaboratoryRow] = Field(default_factory=list)


class Description(BaseModel):
    title_of_health_event: str
    location: Location
    start_date: Optional[str] = None
    latest_onset: Optional[str] = None
    cases: CaseOrDeathCount = Field(default_factory=CaseOrDeathCount)
    deaths: CaseOrDeathCount = Field(default_factory=CaseOrDeathCount)


class Detection(BaseModel):
    date_detected: str
    time_detected: Optional[str] = None
    source_of_information: Dict[str, bool] = Field(default_factory=dict)
    source_of_information_text: Dict[str, str] = Field(default_factory=dict)


class FilterVerification(BaseModel):
    date_of_verification: str
    time_of_verification: Optional[str] = None
    type_of_health_event: Dict[str, bool] = Field(default_factory=dict)
    type_of_health_event_text: Dict[str, str] = Field(default_factory=dict)
    outbreak_declared: Optional[str] = None  # "yes" | "no"
    declared_by: Dict[str, bool] = Field(default_factory=dict)
    declared_by_text: Dict[str, str] = Field(default_factory=dict)
    lgu_validated_by_resu: Optional[str] = None  # "yes" | "no"
    date_of_declaration: Optional[str] = None
    description: Description
    health_status: Dict[str, str] = Field(default_factory=dict)
    profile_of_cases: ProfileBlock = Field(default_factory=ProfileBlock)
    profile_of_deaths: ProfileBlock = Field(default_factory=ProfileBlock)
    summary: Optional[str] = None
    outcome: Dict[str, str] = Field(default_factory=dict)
    laboratory_details: LaboratoryDetails = Field(default_factory=LaboratoryDetails)


class AssessmentStatus(BaseModel):
    status: Optional[str] = None  # "open" | "closed"
    date_closed: Optional[str] = None


class AssistanceRow(BaseModel):
    category: str
    yes_no: Optional[str] = None  # "yes" | "no"
    details: Optional[str] = None
    remarks: Optional[str] = None


class Assessment(BaseModel):
    status: AssessmentStatus = Field(default_factory=AssessmentStatus)
    level_of_concern: Dict[str, Dict[str, bool]] = Field(default_factory=dict)
    assistance_needed: List[AssistanceRow] = Field(default_factory=list)


class ResponseRow(BaseModel):
    category: str
    office_agency: Optional[str] = None
    actions: Optional[str] = None
    date_started: Optional[str] = None
    status: Optional[str] = None  # "pending" | "ongoing" | "done"


class Signature(BaseModel):
    signature: Optional[str] = None
    name: Optional[str] = None
    designation: Optional[str] = None


class ReportGeneration(BaseModel):
    sources_of_information: Optional[str] = None
    who_informed: Optional[str] = None
    prepared_by: Signature = Field(default_factory=Signature)
    reviewed_by: Signature = Field(default_factory=Signature)
    approved_by: Signature = Field(default_factory=Signature)


class EsrReportSubmission(BaseModel):
    """Body for POST /api/esr-reports.

    Required fields match the handoff's explicit minimum-validation list:
    date detected, source of information, date of verification, type of
    health event, title of health event, region/province/municipality/
    barangay (nested under filter_verification.description.location).
    """
    detection: Detection
    filter_verification: FilterVerification
    assessment: Assessment = Field(default_factory=Assessment)
    response: List[ResponseRow] = Field(default_factory=list)
    esu_level: Dict[str, bool] = Field(default_factory=dict)
    report_generation: ReportGeneration = Field(default_factory=ReportGeneration)
    verification_report: bool = False
    follow_up_report_no: Optional[str] = None
    code: Optional[str] = None
