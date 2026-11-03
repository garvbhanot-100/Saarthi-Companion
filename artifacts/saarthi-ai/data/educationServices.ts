import type { ServiceRecord } from "./services";

// Official links that answered a direct request when last checked. Links
// recorded for reference could not be reached from the checking network
// (usually a TLS or regional restriction), but are the department's own domain.
const checked = "Official portal link checked November 2026";
const reference = "Official government source recorded for reference";

export const educationServices: ServiceRecord[] = [
  // Central scholarships and fellowships
  {
    id: "nmms-scholarship",
    name: "National Means-cum-Merit Scholarship Scheme (NMMSS)",
    category: "Scholarships",
    description:
      "Central scholarship for meritorious students from economically weaker families to continue studies from Class 9 to Class 12.",
    eligibility:
      "Students selected through the state-level NMMS examination held in Class 8, studying in government, government-aided or local body schools, with parental income within the scheme limit (currently ₹3.5 lakh a year).",
    documents:
      "NMMS selection details, school and Aadhaar details, income certificate, and bank account details. Renewal needs the previous year's result.",
    source: "scholarships.gov.in",
    officialUrl: "https://scholarships.gov.in/",
    lastVerified: checked,
  },
  {
    id: "central-sector-scholarship-college",
    name: "Central Sector Scheme of Scholarships for College and University Students",
    category: "Scholarships",
    description:
      "Ministry of Education scholarship under PM-USP for meritorious Class 12 pass students pursuing regular college or university courses.",
    eligibility:
      "Students above the 80th percentile of successful candidates in their Class 12 board, enrolled in regular courses, with family income within the scheme limit (currently ₹4.5 lakh a year). Check the current guidelines on NSP.",
    documents:
      "Class 12 mark sheet, admission and institution details, income certificate, Aadhaar and bank account details.",
    source: "scholarships.gov.in",
    officialUrl: "https://scholarships.gov.in/",
    lastVerified: checked,
  },
  {
    id: "aicte-pragati",
    name: "AICTE Pragati Scholarship for Girl Students",
    category: "Scholarships",
    description:
      "AICTE scholarship supporting girl students admitted to AICTE-approved technical degree or diploma courses.",
    eligibility:
      "Girl students admitted to the first year (or second year by lateral entry) of an AICTE-approved degree or diploma course, with family income within the scheme limit (currently ₹8 lakh a year). Up to two girls per family.",
    documents:
      "Admission proof, qualifying exam mark sheet, income certificate, Aadhaar, and bank account details. Apply through the National Scholarship Portal.",
    source: "aicte-india.org",
    officialUrl:
      "https://www.aicte-india.org/schemes/students-development-schemes/Pragati",
    lastVerified: reference,
  },
  {
    id: "aicte-saksham",
    name: "AICTE Saksham Scholarship for Specially-Abled Students",
    category: "Scholarships",
    description:
      "AICTE scholarship for specially-abled students pursuing technical education in AICTE-approved institutions.",
    eligibility:
      "Students with a disability of 40% or more admitted to the first year (or second year by lateral entry) of an AICTE-approved degree or diploma course, with family income within the scheme limit (currently ₹8 lakh a year).",
    documents:
      "Disability certificate, admission proof, qualifying exam mark sheet, income certificate, Aadhaar, and bank account details.",
    source: "aicte-india.org",
    officialUrl:
      "https://www.aicte-india.org/schemes/students-development-schemes/Saksham",
    lastVerified: reference,
  },
  {
    id: "aicte-swanath",
    name: "AICTE Swanath Scholarship",
    category: "Scholarships",
    description:
      "AICTE scholarship for orphans and wards of parents who died of COVID-19 or of armed forces and central police personnel martyred in action.",
    eligibility:
      "Eligible students admitted to an AICTE-approved degree or diploma course, with family income within the scheme limit. Check current AICTE guidelines.",
    documents:
      "Proof of the qualifying category, admission proof, mark sheets, income certificate, Aadhaar, and bank account details.",
    source: "aicte-india.org",
    officialUrl:
      "https://www.aicte-india.org/schemes/students-development-schemes/Swanath",
    lastVerified: reference,
  },
  {
    id: "aicte-pg-scholarship",
    name: "AICTE PG Scholarship (GATE/GPAT/CEED)",
    category: "Scholarships",
    description:
      "Monthly scholarship from AICTE for postgraduate students admitted to AICTE-approved ME, MTech, MPharm, MArch and similar programmes.",
    eligibility:
      "GATE, GPAT or CEED qualified students admitted to an eligible full-time PG programme in an AICTE-approved institution.",
    documents:
      "Valid GATE/GPAT/CEED scorecard, admission details, Aadhaar, and bank account details. The institution verifies the application.",
    source: "pgscholarship.aicte-india.org",
    officialUrl: "https://pgscholarship.aicte-india.org/",
    lastVerified: checked,
  },
  {
    id: "pmsss-jk-ladakh",
    name: "PM Special Scholarship Scheme for J&K and Ladakh (PMSSS)",
    category: "Scholarships",
    description:
      "AICTE-administered scholarship for students from Jammu & Kashmir and Ladakh to pursue higher education in other states.",
    eligibility:
      "Domiciles of the UTs of Jammu & Kashmir and Ladakh who passed Class 12 from the JKBOSE or CBSE schools there, within the scheme's income limit. Check the current AICTE notification.",
    documents:
      "Domicile certificate, Class 10 and 12 mark sheets, income certificate, Aadhaar, and bank account details.",
    source: "aicte-india.org",
    officialUrl: "https://www.aicte-india.org/",
    lastVerified: reference,
  },
  {
    id: "post-matric-scholarship-sc",
    name: "Post-Matric Scholarship for Scheduled Caste Students",
    category: "Scholarships",
    description:
      "Centrally sponsored scholarship from the Ministry of Social Justice for SC students studying beyond Class 10.",
    eligibility:
      "SC students in post-matric or post-secondary courses with family income within the scheme limit (currently ₹2.5 lakh a year). Applications are handled through state scholarship portals or NSP.",
    documents:
      "Caste certificate, income certificate, previous mark sheets, admission and fee details, Aadhaar, and bank account details.",
    source: "socialjustice.gov.in",
    officialUrl: "https://socialjustice.gov.in/",
    lastVerified: checked,
  },
  {
    id: "pre-matric-scholarship-sc",
    name: "Pre-Matric Scholarship for Scheduled Caste Students (Classes 9 and 10)",
    category: "Scholarships",
    description:
      "Scholarship for SC students in Classes 9 and 10 to reduce dropouts at the secondary stage.",
    eligibility:
      "SC students studying in Class 9 or 10 with parental income within the scheme limit (currently ₹2.5 lakh a year). Applications are handled by the state or UT.",
    documents:
      "Caste certificate, income certificate, school details, Aadhaar, and bank account details.",
    source: "socialjustice.gov.in",
    officialUrl: "https://socialjustice.gov.in/",
    lastVerified: checked,
  },
  {
    id: "pre-matric-hazardous-occupations",
    name: "Pre-Matric Scholarship for Children of Those Engaged in Unclean and Hazardous Occupations",
    category: "Scholarships",
    description:
      "Scholarship for children of parents engaged in manual scavenging, tanning, flaying, waste picking, or hazardous cleaning, irrespective of caste.",
    eligibility:
      "School students whose parents or guardians are engaged in the occupations covered by the scheme. Applications are handled by the state or UT.",
    documents:
      "Occupation certificate issued by the competent authority, school details, Aadhaar, and bank account details.",
    source: "socialjustice.gov.in",
    officialUrl: "https://socialjustice.gov.in/",
    lastVerified: checked,
  },
  {
    id: "top-class-education-sc",
    name: "Top Class Education Scheme for SC Students",
    category: "Scholarships",
    description:
      "Full financial support for SC students admitted to notified premier institutions such as IITs, IIMs, AIIMS, and NITs.",
    eligibility:
      "SC students admitted to a notified institution with family income within the scheme limit (currently ₹8 lakh a year).",
    documents:
      "Caste certificate, income certificate, admission and fee details, Aadhaar, and bank account details. Apply through NSP.",
    source: "socialjustice.gov.in",
    officialUrl: "https://socialjustice.gov.in/",
    lastVerified: checked,
  },
  {
    id: "post-matric-scholarship-st",
    name: "Post-Matric Scholarship for Scheduled Tribe Students",
    category: "Scholarships",
    description:
      "Ministry of Tribal Affairs scholarship for ST students studying in post-matric and post-secondary courses.",
    eligibility:
      "ST students in Class 11 and above with parental income within the scheme limit (currently ₹2.5 lakh a year). Applications are handled through state portals.",
    documents:
      "ST certificate, income certificate, previous mark sheets, admission and fee details, Aadhaar, and bank account details.",
    source: "tribal.nic.in",
    officialUrl: "https://tribal.nic.in/",
    lastVerified: checked,
  },
  {
    id: "pre-matric-scholarship-st",
    name: "Pre-Matric Scholarship for Scheduled Tribe Students",
    category: "Scholarships",
    description:
      "Scholarship for ST students in Classes 9 and 10 from the Ministry of Tribal Affairs.",
    eligibility:
      "ST students in Class 9 or 10 with parental income within the scheme limit. Applications are handled by the state or UT.",
    documents:
      "ST certificate, income certificate, school details, Aadhaar, and bank account details.",
    source: "tribal.nic.in",
    officialUrl: "https://tribal.nic.in/",
    lastVerified: checked,
  },
  {
    id: "national-fellowship-st",
    name: "National Fellowship and Scholarship for Higher Education of ST Students",
    category: "Scholarships",
    description:
      "Fellowship for ST students pursuing MPhil or PhD and scholarship for top-class graduate and postgraduate studies.",
    eligibility:
      "ST students admitted to eligible research programmes or notified institutions, as set out in the current Ministry of Tribal Affairs guidelines.",
    documents:
      "ST certificate, admission or registration proof, mark sheets, income certificate, Aadhaar, and bank account details.",
    source: "fellowship.tribal.gov.in",
    officialUrl: "https://fellowship.tribal.gov.in/",
    lastVerified: checked,
  },
  {
    id: "national-overseas-scholarship-st",
    name: "National Overseas Scholarship for ST Students",
    category: "Scholarships",
    description:
      "Scholarship for ST students to pursue master's, PhD, or postdoctoral studies at foreign universities.",
    eligibility:
      "ST students meeting the age, qualification, income, and admission conditions in the current Ministry of Tribal Affairs notification.",
    documents:
      "ST certificate, income certificate, academic records, foreign university admission letter, passport, and Aadhaar.",
    source: "overseas.tribal.gov.in",
    officialUrl: "https://overseas.tribal.gov.in/",
    lastVerified: checked,
  },
  {
    id: "eklavya-model-residential-schools",
    name: "Eklavya Model Residential Schools (EMRS)",
    category: "Education",
    description:
      "Residential schools for ST children run under the National Education Society for Tribal Students, with information on admissions and schools.",
    eligibility:
      "Primarily ST students. Admission rules and seats are set by the state EMRS society and NESTS.",
    documents:
      "ST certificate, previous school records, Aadhaar, and other documents listed in the admission notice.",
    source: "nests.tribal.gov.in",
    officialUrl: "https://nests.tribal.gov.in/",
    lastVerified: checked,
  },
  {
    id: "pwd-pre-matric-scholarship",
    name: "Pre-Matric Scholarship for Students with Disabilities",
    category: "Scholarships",
    description:
      "Department of Empowerment of Persons with Disabilities scholarship for students with disabilities in Classes 9 and 10.",
    eligibility:
      "Students with a disability of 40% or more in Class 9 or 10 with parental income within the scheme limit (currently ₹2.5 lakh a year).",
    documents:
      "Disability certificate or UDID, income certificate, school details, Aadhaar, and bank account details. Apply through NSP.",
    source: "depwd.gov.in",
    officialUrl: "https://depwd.gov.in/scholarship/",
    lastVerified: checked,
  },
  {
    id: "pwd-post-matric-scholarship",
    name: "Post-Matric Scholarship for Students with Disabilities",
    category: "Scholarships",
    description:
      "Scholarship for students with disabilities studying from Class 11 to postgraduate degree or diploma.",
    eligibility:
      "Students with a disability of 40% or more with parental income within the scheme limit (currently ₹2.5 lakh a year).",
    documents:
      "Disability certificate or UDID, income certificate, mark sheets, admission details, Aadhaar, and bank account details. Apply through NSP.",
    source: "depwd.gov.in",
    officialUrl: "https://depwd.gov.in/scholarship/",
    lastVerified: checked,
  },
  {
    id: "pwd-top-class-education",
    name: "Top Class Education Scholarship for Students with Disabilities",
    category: "Scholarships",
    description:
      "Scholarship for students with disabilities admitted to notified institutions of excellence for graduate and postgraduate studies.",
    eligibility:
      "Students with a disability of 40% or more admitted to a notified institution with family income within the scheme limit (currently ₹8 lakh a year).",
    documents:
      "Disability certificate or UDID, income certificate, admission details, Aadhaar, and bank account details. Apply through NSP.",
    source: "depwd.gov.in",
    officialUrl: "https://depwd.gov.in/scholarship/",
    lastVerified: checked,
  },
  {
    id: "pwd-national-overseas-scholarship",
    name: "National Overseas Scholarship for Students with Disabilities",
    category: "Scholarships",
    description:
      "Scholarship for students with disabilities to pursue master's or PhD studies abroad.",
    eligibility:
      "Students with a disability of 40% or more meeting the age, income, and admission conditions in the current DEPwD notification.",
    documents:
      "Disability certificate or UDID, income certificate, academic records, foreign admission letter, and passport.",
    source: "depwd.gov.in",
    officialUrl: "https://depwd.gov.in/scholarship/",
    lastVerified: checked,
  },
  {
    id: "minority-post-matric-scholarship",
    name: "Post-Matric Scholarship for Minority Communities",
    category: "Scholarships",
    description:
      "Ministry of Minority Affairs scholarship for students from notified minority communities studying from Class 11 to PhD.",
    eligibility:
      "Students from the six notified minority communities with at least 50% marks in the previous final exam and family income within the scheme limit (currently ₹2 lakh a year).",
    documents:
      "Community declaration, income certificate, previous mark sheet, fee receipt, Aadhaar, and bank account details. Apply through NSP.",
    source: "minorityaffairs.gov.in",
    officialUrl: "https://minorityaffairs.gov.in/",
    lastVerified: checked,
  },
  {
    id: "minority-pre-matric-scholarship",
    name: "Pre-Matric Scholarship for Minority Communities",
    category: "Scholarships",
    description:
      "Scholarship for school students from notified minority communities, currently covering Classes 9 and 10.",
    eligibility:
      "Students from notified minority communities with at least 50% marks in the previous final exam and family income within the scheme limit (currently ₹1 lakh a year).",
    documents:
      "Community declaration, income certificate, previous mark sheet, Aadhaar, and bank account details. Apply through NSP.",
    source: "minorityaffairs.gov.in",
    officialUrl: "https://minorityaffairs.gov.in/",
    lastVerified: checked,
  },
  {
    id: "minority-merit-cum-means-scholarship",
    name: "Merit-cum-Means Scholarship for Professional and Technical Courses (Minorities)",
    category: "Scholarships",
    description:
      "Scholarship for minority community students pursuing professional and technical courses at undergraduate and postgraduate level.",
    eligibility:
      "Students from notified minority communities admitted to eligible professional or technical courses, with at least 50% marks and family income within the scheme limit (currently ₹2.5 lakh a year).",
    documents:
      "Community declaration, income certificate, mark sheets, admission and fee details, Aadhaar, and bank account details. Apply through NSP.",
    source: "minorityaffairs.gov.in",
    officialUrl: "https://minorityaffairs.gov.in/",
    lastVerified: checked,
  },
  {
    id: "ugc-ishan-uday",
    name: "UGC Ishan Uday Special Scholarship for North Eastern Region",
    category: "Scholarships",
    description:
      "UGC scholarship for students from the North Eastern Region pursuing general, technical, professional, or medical degree courses.",
    eligibility:
      "Domiciles of the North Eastern states admitted to the first year of an undergraduate programme, with family income within the scheme limit (currently ₹4.5 lakh a year).",
    documents:
      "Domicile certificate, Class 12 mark sheet, admission proof, income certificate, Aadhaar, and bank account details. Apply through NSP.",
    source: "ugc.gov.in",
    officialUrl: "https://www.ugc.gov.in/ugc_schemes/scholarships",
    lastVerified: checked,
  },
  {
    id: "ugc-pg-single-girl-child",
    name: "PG Indira Gandhi Scholarship for Single Girl Child",
    category: "Scholarships",
    description:
      "UGC scholarship for a single girl child pursuing a regular full-time postgraduate (non-professional) course.",
    eligibility:
      "A single girl child (no sibling) admitted to the first year of a regular full-time PG course, within the age limit in the current UGC guidelines.",
    documents:
      "Single girl child affidavit, admission proof, graduation mark sheet, Aadhaar, and bank account details. Apply through NSP.",
    source: "ugc.gov.in",
    officialUrl: "https://www.ugc.gov.in/ugc_schemes/scholarships",
    lastVerified: checked,
  },
  {
    id: "ugc-pg-university-rank-holders",
    name: "UGC PG Scholarship for University Rank Holders",
    category: "Scholarships",
    description:
      "UGC scholarship for first and second rank holders at the undergraduate level who continue to postgraduate studies.",
    eligibility:
      "Students who secured the first or second rank in their undergraduate programme and joined a PG course, as per current UGC guidelines.",
    documents:
      "Rank certificate from the university, PG admission proof, Aadhaar, and bank account details. Apply through NSP.",
    source: "ugc.gov.in",
    officialUrl: "https://www.ugc.gov.in/ugc_schemes/scholarships",
    lastVerified: checked,
  },
  {
    id: "ugc-pg-scholarship-sc-st-professional",
    name: "UGC PG Scholarship for SC/ST Students in Professional Courses",
    category: "Scholarships",
    description:
      "UGC scholarship for SC and ST students pursuing postgraduate professional courses such as ME, MTech, and MPharm.",
    eligibility:
      "SC or ST students admitted to eligible PG professional courses, as per current UGC guidelines.",
    documents:
      "Caste or tribe certificate, PG admission proof, mark sheets, Aadhaar, and bank account details. Apply through NSP.",
    source: "ugc.gov.in",
    officialUrl: "https://www.ugc.gov.in/ugc_schemes/scholarships",
    lastVerified: checked,
  },
  {
    id: "pm-scholarship-ex-servicemen",
    name: "Prime Minister's Scholarship Scheme for Wards of Ex-Servicemen",
    category: "Scholarships",
    description:
      "Kendriya Sainik Board scholarship for wards and widows of ex-servicemen pursuing professional degree courses.",
    eligibility:
      "Dependent wards and widows of ex-servicemen and ex-Coast Guard personnel admitted to the first year of an eligible professional course, with the minimum marks set in the current guidelines.",
    documents:
      "Ex-servicemen identity documents, admission proof, Class 12 or qualifying mark sheet, Aadhaar, and bank account details.",
    source: "ksb.gov.in",
    officialUrl: "https://ksb.gov.in/",
    lastVerified: reference,
  },
  {
    id: "pm-scholarship-rpf",
    name: "Prime Minister's Scholarship Scheme for Wards of RPF/RPSF Personnel",
    category: "Scholarships",
    description:
      "Ministry of Railways scholarship for wards of serving and former RPF and RPSF personnel pursuing professional courses.",
    eligibility:
      "Wards and widows of RPF/RPSF personnel admitted to eligible professional degree courses, as per the guidelines published on NSP.",
    documents:
      "Service certificate of the parent, admission proof, mark sheets, Aadhaar, and bank account details.",
    source: "scholarships.gov.in",
    officialUrl: "https://scholarships.gov.in/",
    lastVerified: checked,
  },
  {
    id: "pm-scholarship-capf",
    name: "Prime Minister's Scholarship Scheme for Wards of CAPF and Assam Rifles",
    category: "Scholarships",
    description:
      "Ministry of Home Affairs scholarship for wards and widows of CAPF and Assam Rifles personnel pursuing professional courses.",
    eligibility:
      "Wards and widows of serving or former CAPF and Assam Rifles personnel admitted to eligible professional degree courses, as per guidelines on NSP.",
    documents:
      "Service certificate of the parent, admission proof, mark sheets, Aadhaar, and bank account details.",
    source: "scholarships.gov.in",
    officialUrl: "https://scholarships.gov.in/",
    lastVerified: checked,
  },
  {
    id: "labour-welfare-education-assistance",
    name: "Education Assistance for Wards of Beedi, Cine and Mine Workers",
    category: "Scholarships",
    description:
      "Ministry of Labour and Employment financial assistance for the education of wards of beedi, cine, and non-coal mine workers.",
    eligibility:
      "Children of workers registered in the covered sectors who meet the income and class conditions in the current guidelines on NSP.",
    documents:
      "Worker identity card, school or college details, mark sheets, Aadhaar, and bank account details.",
    source: "scholarships.gov.in",
    officialUrl: "https://scholarships.gov.in/",
    lastVerified: checked,
  },
  {
    id: "inspire-she-scholarship",
    name: "INSPIRE Scholarship for Higher Education (SHE)",
    category: "Scholarships",
    description:
      "Department of Science and Technology scholarship for talented students pursuing bachelor's and master's degrees in natural and basic sciences.",
    eligibility:
      "Students in the top 1% of their Class 12 board or meeting another eligibility route in the current DST guidelines, enrolled in eligible science courses.",
    documents:
      "Class 12 mark sheet, eligibility proof, institution endorsement, Aadhaar, and bank account details.",
    source: "online-inspire.gov.in",
    officialUrl: "https://online-inspire.gov.in/",
    lastVerified: checked,
  },
  {
    id: "inspire-manak",
    name: "INSPIRE-MANAK Awards",
    category: "Education",
    description:
      "DST and National Innovation Foundation programme that nominates school students' original ideas for awards and mentoring.",
    eligibility:
      "Students of Classes 6 to 10 nominated by their schools through the official portal during the nomination window.",
    documents:
      "School registration on the portal, student details, and the idea submission. Requirements are shown during nomination.",
    source: "inspireawards-dst.gov.in",
    officialUrl: "https://www.inspireawards-dst.gov.in/",
    lastVerified: checked,
  },
  {
    id: "pm-research-fellowship",
    name: "Prime Minister's Research Fellowship (PMRF)",
    category: "Scholarships",
    description:
      "Ministry of Education fellowship for doctoral research at IITs, IISc, IISERs, and other eligible institutions.",
    eligibility:
      "Candidates admitted to or applying for PhD programmes at PMRF-granting institutions who meet the current eligibility channels.",
    documents:
      "Academic records, PhD admission details, research proposal, and recommendation letters as required by the portal.",
    source: "pmrf.in",
    officialUrl: "https://www.pmrf.in/",
    lastVerified: checked,
  },
  {
    id: "visvesvaraya-phd-scheme",
    name: "Visvesvaraya PhD Scheme for Electronics and IT",
    category: "Scholarships",
    description:
      "MeitY scheme supporting full-time and part-time PhD candidates in electronics system design and IT/IT-enabled services.",
    eligibility:
      "PhD candidates admitted to participating institutions in the eligible areas, as per current MeitY guidelines.",
    documents:
      "PhD admission details, academic records, and institution nomination as required on the portal.",
    source: "phd.dic.gov.in",
    officialUrl: "https://phd.dic.gov.in/",
    lastVerified: checked,
  },
  {
    id: "cbse-single-girl-child-scholarship",
    name: "CBSE Merit Scholarship for Single Girl Child",
    category: "Scholarships",
    description:
      "CBSE scholarship for single girl children who passed Class 10 from CBSE and continue in Class 11 and 12 in a CBSE school.",
    eligibility:
      "Single girl child students meeting the marks, fee, and school conditions in the current CBSE notification.",
    documents:
      "Single girl child affidavit, Class 10 mark sheet, school and fee details, and bank account details.",
    source: "cbse.gov.in",
    officialUrl: "https://www.cbse.gov.in/cbsenew/scholar.html",
    lastVerified: checked,
  },
  // Education loans and financing
  {
    id: "pm-vidyalaxmi",
    name: "PM-Vidyalaxmi Education Loan Support",
    category: "Scholarships",
    description:
      "Single-window portal for collateral-free and guarantor-free education loans and interest subvention for students admitted to quality higher education institutions.",
    eligibility:
      "Students admitted to institutions covered by the scheme (based on NIRF rankings). Interest subvention applies to eligible students within the family income limit set in the scheme.",
    documents:
      "Admission letter, fee structure, academic records, identity and address proof, income proof, and bank-specific documents.",
    source: "pmvidyalaxmi.co.in",
    officialUrl: "https://pmvidyalaxmi.co.in/",
    lastVerified: checked,
  },
  {
    id: "central-sector-interest-subsidy",
    name: "Central Sector Interest Subsidy Scheme (CSIS) on Education Loans",
    category: "Scholarships",
    description:
      "Interest subsidy during the moratorium period on education loans for professional and technical courses in India, available through the PM-Vidyalaxmi portal.",
    eligibility:
      "Students from economically weaker sections within the scheme's family income limit, with loans taken under the eligible bank education loan scheme.",
    documents:
      "Income certificate, admission proof, and loan account details. The lending bank processes the claim.",
    source: "pmvidyalaxmi.co.in",
    officialUrl: "https://pmvidyalaxmi.co.in/",
    lastVerified: checked,
  },
  {
    id: "credit-guarantee-education-loans",
    name: "Credit Guarantee Fund Scheme for Education Loans (CGFSEL)",
    category: "Scholarships",
    description:
      "NCGTC scheme that guarantees eligible education loans so banks can lend without collateral or third-party guarantee.",
    eligibility:
      "Students taking eligible education loans from member lending institutions within the scheme's loan limit.",
    documents:
      "Handled by the lending bank. Students provide the documents the bank requests for the education loan.",
    source: "ncgtc.in",
    officialUrl: "https://www.ncgtc.in/",
    lastVerified: checked,
  },
  // National programmes and schools
  {
    id: "national-apprenticeship-training-scheme",
    name: "National Apprenticeship Training Scheme (NATS)",
    category: "Education",
    description:
      "Ministry of Education scheme offering one-year apprenticeships with a stipend for graduates and diploma holders.",
    eligibility:
      "Engineering, general stream, and diploma graduates within the time since graduation allowed by the current NATS rules.",
    documents:
      "Degree or diploma certificate, mark sheets, Aadhaar, and bank account details. Register on the NATS portal.",
    source: "nats.education.gov.in",
    officialUrl: "https://nats.education.gov.in/",
    lastVerified: checked,
  },
  {
    id: "samagra-shiksha",
    name: "Samagra Shiksha",
    category: "Education",
    description:
      "Integrated centrally sponsored scheme for school education from pre-school to Class 12, run with states through the Department of School Education and Literacy.",
    eligibility:
      "Benefits such as free textbooks, uniforms, and inclusive education support reach students through government schools as implemented by each state.",
    documents:
      "No individual application. Contact your school or the state Samagra Shiksha office for benefits.",
    source: "dsel.education.gov.in",
    officialUrl: "https://dsel.education.gov.in/",
    linkType: "information",
    lastVerified: checked,
  },
  {
    id: "pm-shri-schools",
    name: "PM SHRI Schools",
    category: "Education",
    description:
      "Find information about PM Schools for Rising India, existing government schools being upgraded as model schools under NEP 2020.",
    eligibility:
      "Students enrol through the normal admission process of the selected government school.",
    documents:
      "Admission documents as required by the school and the state.",
    source: "pmshrischools.education.gov.in",
    officialUrl: "https://pmshrischools.education.gov.in/",
    lastVerified: checked,
  },
  {
    id: "pm-poshan",
    name: "PM POSHAN (School Meal Scheme)",
    category: "Education",
    description:
      "Information on the scheme that provides hot cooked meals to children in government and government-aided schools.",
    eligibility:
      "Children studying in Balvatika and Classes 1 to 8 in eligible government and government-aided schools.",
    documents: "No application is needed. Meals are provided through the school.",
    source: "pmposhan.education.gov.in",
    officialUrl: "https://pmposhan.education.gov.in/",
    linkType: "information",
    lastVerified: checked,
  },
  {
    id: "pm-evidya",
    name: "PM eVidya",
    category: "Education",
    description:
      "Ministry of Education initiative bringing together digital, online, and on-air education, including DTH TV channels for school classes.",
    eligibility: "Open to all learners.",
    documents: "No documents are needed to access the content.",
    source: "pmevidya.education.gov.in",
    officialUrl: "https://pmevidya.education.gov.in/",
    lastVerified: checked,
  },
  {
    id: "nipun-bharat",
    name: "NIPUN Bharat Mission",
    category: "Education",
    description:
      "National mission for foundational literacy and numeracy so that every child can read and do basic maths by the end of Grade 3.",
    eligibility:
      "Implemented through schools and anganwadis. Parents and teachers can use the official resources.",
    documents: "No application is needed.",
    source: "nipunbharat.education.gov.in",
    officialUrl: "https://nipunbharat.education.gov.in/",
    linkType: "information",
    lastVerified: checked,
  },
  {
    id: "ullas-literacy",
    name: "ULLAS – New India Literacy Programme",
    category: "Education",
    description:
      "Adult education programme for people aged 15 and above who missed schooling, with learner and volunteer registration.",
    eligibility:
      "Non-literate adults aged 15 and above can register as learners. Volunteers can register to teach.",
    documents: "Basic personal details. Requirements are shown on the portal.",
    source: "ullas.education.gov.in",
    officialUrl: "https://ullas.education.gov.in/",
    lastVerified: checked,
  },
  {
    id: "kendriya-vidyalaya-admission",
    name: "Kendriya Vidyalaya Admissions",
    category: "Education",
    description:
      "Admission notices, schedules, and guidelines for Kendriya Vidyalayas run by the Kendriya Vidyalaya Sangathan.",
    eligibility:
      "Admission follows the KVS priority categories and age criteria in the current admission guidelines.",
    documents:
      "Birth certificate, address proof, category or service certificates as applicable, and documents listed in the admission notice.",
    source: "kvsangathan.nic.in",
    officialUrl: "https://kvsangathan.nic.in/",
    lastVerified: checked,
  },
  {
    id: "navodaya-selection-test",
    name: "Jawahar Navodaya Vidyalaya Selection Test (JNVST)",
    category: "Education",
    description:
      "Admission test for Class 6 and lateral entry to Class 9 in Jawahar Navodaya Vidyalayas, residential schools for talented rural children.",
    eligibility:
      "Students meeting the age, class, and district residence conditions in the current JNVST prospectus.",
    documents:
      "Certificate from the current school, photograph, signatures, and Aadhaar or residence details as listed in the prospectus.",
    source: "navodaya.gov.in",
    officialUrl: "https://navodaya.gov.in/",
    lastVerified: reference,
  },
  {
    id: "nios-open-schooling",
    name: "NIOS Open Schooling",
    category: "Education",
    description:
      "National Institute of Open Schooling admissions, exams, and results for secondary, senior secondary, and vocational courses.",
    eligibility:
      "Learners meeting the minimum age and qualification for the chosen course.",
    documents:
      "Age proof, previous qualification certificate for senior secondary, photograph, and address proof.",
    source: "nios.ac.in",
    officialUrl: "https://www.nios.ac.in/",
    lastVerified: checked,
  },
  {
    id: "ncert-resources",
    name: "NCERT",
    category: "Education",
    description:
      "National Council of Educational Research and Training publications, curricula, and learning resources for schools.",
    eligibility: "Open to all.",
    documents: "No documents are needed.",
    source: "ncert.nic.in",
    officialUrl: "https://ncert.nic.in/",
    lastVerified: reference,
  },
  {
    id: "cbse-services",
    name: "CBSE Services",
    category: "Education",
    description:
      "Central Board of Secondary Education notices, exam information, circulars, and student services.",
    eligibility: "Students, parents, and schools affiliated with CBSE.",
    documents: "Depends on the service. Check the CBSE website.",
    source: "cbse.gov.in",
    officialUrl: "https://www.cbse.gov.in/",
    lastVerified: checked,
  },
  {
    id: "cbse-results",
    name: "CBSE Results",
    category: "Education",
    description: "Check Class 10 and Class 12 CBSE board examination results.",
    eligibility: "Students who appeared in CBSE board examinations.",
    documents: "Roll number, school number, and other details asked on the result page.",
    source: "cbseresults.nic.in",
    officialUrl: "https://cbseresults.nic.in/",
    lastVerified: checked,
  },
  // Entrance exams and counselling
  {
    id: "jee-advanced",
    name: "JEE (Advanced)",
    category: "Education",
    description:
      "Entrance examination for admission to the IITs, conducted by one of the IITs each year.",
    eligibility:
      "Top JEE (Main) qualifiers meeting the age, attempt, and Class 12 criteria in the current information brochure.",
    documents:
      "JEE (Main) details, Class 12 details, category certificates if applicable, photograph, and signature.",
    source: "jeeadv.ac.in",
    officialUrl: "https://jeeadv.ac.in/",
    lastVerified: checked,
  },
  {
    id: "josaa-counselling",
    name: "JoSAA Counselling",
    category: "Education",
    description:
      "Joint Seat Allocation Authority counselling for seats in IITs, NITs, IIITs, and other government-funded technical institutes.",
    eligibility: "Candidates qualifying in JEE (Main) or JEE (Advanced) as applicable.",
    documents:
      "Score cards, Class 10 and 12 certificates, category and PwD certificates if applicable, and photo ID.",
    source: "josaa.nic.in",
    officialUrl: "https://josaa.nic.in/",
    lastVerified: checked,
  },
  {
    id: "csab-counselling",
    name: "CSAB Counselling",
    category: "Education",
    description:
      "Central Seat Allocation Board special rounds for NIT+ system seats and other central schemes after JoSAA.",
    eligibility: "Eligible JEE (Main) candidates as notified in the current CSAB information.",
    documents: "JEE (Main) score card, academic certificates, category certificates, and photo ID.",
    source: "csab.nic.in",
    officialUrl: "https://csab.nic.in/",
    lastVerified: checked,
  },
  {
    id: "mcc-medical-counselling",
    name: "Medical Counselling Committee (MCC) Counselling",
    category: "Education",
    description:
      "Counselling for All India Quota and central institution seats in MBBS, BDS, PG medical, and other courses.",
    eligibility: "Candidates who qualified NEET for the relevant course.",
    documents:
      "NEET admit card and score card, Class 10 and 12 certificates, category certificates, and photo ID.",
    source: "mcc.nic.in",
    officialUrl: "https://mcc.nic.in/",
    lastVerified: checked,
  },
  {
    id: "ugc-net",
    name: "UGC NET",
    category: "Education",
    description:
      "National Eligibility Test conducted by NTA for Assistant Professor eligibility, Junior Research Fellowship, and PhD admission.",
    eligibility:
      "Candidates with a master's degree or equivalent meeting the marks and age conditions in the current notification.",
    documents: "Qualifying degree details, category certificates, photograph, signature, and photo ID.",
    source: "ugcnet.nta.ac.in",
    officialUrl: "https://ugcnet.nta.ac.in/",
    lastVerified: reference,
  },
  {
    id: "csir-net",
    name: "CSIR-UGC NET",
    category: "Education",
    description:
      "Joint CSIR-UGC test for Junior Research Fellowship and lectureship in science subjects, conducted by NTA.",
    eligibility:
      "Candidates with an eligible science degree meeting the marks and age conditions in the current notification.",
    documents: "Qualifying degree details, category certificates, photograph, signature, and photo ID.",
    source: "csirnet.nta.ac.in",
    officialUrl: "https://csirnet.nta.ac.in/",
    lastVerified: reference,
  },
  {
    id: "ignou-admissions",
    name: "IGNOU Admissions",
    category: "Education",
    description:
      "Online admission for distance and online programmes of the Indira Gandhi National Open University.",
    eligibility: "Learners meeting the qualification required for the chosen programme.",
    documents: "Qualifying certificates, photograph, signature, ID proof, and category certificate if applicable.",
    source: "ignouadmission.samarth.edu.in",
    officialUrl: "https://ignouadmission.samarth.edu.in/",
    lastVerified: checked,
  },
  // Digital learning
  {
    id: "nptel",
    name: "NPTEL",
    category: "Education",
    description:
      "Online courses in engineering, science, and humanities from IITs and IISc, funded by the Ministry of Education, with optional certification exams.",
    eligibility: "Open to all learners. Certification exams have a fee.",
    documents: "Registration details. Photo ID is needed for proctored exams.",
    source: "nptel.ac.in",
    officialUrl: "https://nptel.ac.in/",
    lastVerified: checked,
  },
  // State scholarship and education support portals
  {
    id: "maharashtra-mahadbt-scholarships",
    name: "MahaDBT Scholarships (Maharashtra)",
    category: "Scholarships",
    description:
      "Maharashtra Government's Direct Benefit Transfer portal for state scholarships and post-matric schemes.",
    eligibility:
      "Maharashtra students meeting the domicile, category, income, and course conditions of each scheme.",
    documents:
      "Domicile, caste, and income certificates, mark sheets, admission and fee details, Aadhaar, and bank account details.",
    source: "mahadbt.maharashtra.gov.in",
    officialUrl: "https://mahadbt.maharashtra.gov.in/",
    lastVerified: checked,
  },
  {
    id: "karnataka-ssp-scholarships",
    name: "State Scholarship Portal (Karnataka)",
    category: "Scholarships",
    description:
      "Karnataka Government's portal for post-matric scholarships and fee concessions from multiple state departments.",
    eligibility:
      "Karnataka students meeting the category, income, and course conditions of each scheme.",
    documents:
      "Caste and income certificates (RD number), mark sheets, admission details, Aadhaar, and bank account details.",
    source: "ssp.postmatric.karnataka.gov.in",
    officialUrl: "https://ssp.postmatric.karnataka.gov.in/",
    lastVerified: checked,
  },
  {
    id: "bihar-post-matric-scholarship",
    name: "Post-Matric Scholarship Portal (Bihar)",
    category: "Scholarships",
    description:
      "Bihar Government's online portal for post-matric scholarships for SC, ST, BC, and EBC students.",
    eligibility:
      "Bihar students from eligible categories within the income limit, enrolled in recognised post-matric courses.",
    documents:
      "Caste, income, and residence certificates, mark sheets, admission and fee details, Aadhaar, and bank account details.",
    source: "pmsonline.bihar.gov.in",
    officialUrl: "https://pmsonline.bihar.gov.in/",
    lastVerified: checked,
  },
  {
    id: "bihar-student-credit-card",
    name: "Bihar Student Credit Card Scheme (Bihar)",
    category: "Scholarships",
    description:
      "Bihar Government education loan scheme under the 7 Nishchay Yuva Upmission for students pursuing higher education after Class 12.",
    eligibility:
      "Bihar residents who passed Class 12 and are admitted to eligible higher education courses, within the age limit in the current guidelines.",
    documents:
      "Residence certificate, Class 10 and 12 mark sheets, admission letter, fee structure, Aadhaar, and bank account details.",
    source: "7nishchay-yuvaupmission.bihar.gov.in",
    officialUrl: "https://www.7nishchay-yuvaupmission.bihar.gov.in/",
    lastVerified: checked,
  },
  {
    id: "bihar-kanya-utthan",
    name: "Mukhyamantri Kanya Utthan Yojana (Bihar)",
    category: "Scholarships",
    description:
      "Bihar Government incentive for girl students who pass intermediate and graduation exams.",
    eligibility:
      "Unmarried and graduate girl students from Bihar meeting the conditions in the current notice.",
    documents:
      "Mark sheet or degree, residence details, Aadhaar, and bank account details.",
    source: "medhasoft.bih.nic.in",
    officialUrl: "https://medhasoft.bih.nic.in/",
    lastVerified: reference,
  },
  {
    id: "up-scholarship",
    name: "Scholarship and Fee Reimbursement (Uttar Pradesh)",
    category: "Scholarships",
    description:
      "Uttar Pradesh Government's portal for pre-matric and post-matric scholarships and fee reimbursement.",
    eligibility:
      "UP students from eligible categories within the income limits, studying in recognised institutions.",
    documents:
      "Caste and income certificates, mark sheets, admission and fee details, Aadhaar, and bank account details.",
    source: "scholarship.up.gov.in",
    officialUrl: "https://scholarship.up.gov.in/",
    lastVerified: reference,
  },
  {
    id: "up-kanya-sumangala",
    name: "Mukhyamantri Kanya Sumangala Yojana (Uttar Pradesh)",
    category: "Scholarships",
    description:
      "Uttar Pradesh scheme providing staged financial support to girls from birth through school and graduation admission.",
    eligibility:
      "Girls from UP families meeting the residence, income, and family conditions in the current guidelines.",
    documents:
      "Birth certificate, residence and income proof, school admission proof for later stages, Aadhaar, and bank account details.",
    source: "mksy.up.gov.in",
    officialUrl: "https://mksy.up.gov.in/",
    lastVerified: checked,
  },
  {
    id: "wb-aikyashree",
    name: "Aikyashree Scholarships (West Bengal)",
    category: "Scholarships",
    description:
      "West Bengal Minorities Development and Finance Corporation scholarships for minority students.",
    eligibility:
      "West Bengal minority community students meeting the marks and income conditions of each scheme.",
    documents:
      "Minority declaration, income certificate, mark sheets, institution details, Aadhaar, and bank account details.",
    source: "wbmdfcscholarship.org",
    officialUrl: "https://wbmdfcscholarship.org/",
    lastVerified: checked,
  },
  {
    id: "wb-svmcm",
    name: "Swami Vivekananda Merit-cum-Means Scholarship (West Bengal)",
    category: "Scholarships",
    description:
      "West Bengal Government scholarship for meritorious students from economically weaker families from Class 11 to higher education.",
    eligibility:
      "West Bengal students meeting the marks and family income conditions in the current notice.",
    documents:
      "Mark sheets, income certificate, institution details, Aadhaar, and bank account details.",
    source: "svmcm.wbhed.gov.in",
    officialUrl: "https://svmcm.wbhed.gov.in/",
    lastVerified: reference,
  },
  {
    id: "wb-kanyashree",
    name: "Kanyashree Prakalpa (West Bengal)",
    category: "Scholarships",
    description:
      "West Bengal conditional cash transfer for girls to continue education and delay marriage.",
    eligibility:
      "Unmarried girls in West Bengal enrolled in education, within the age and family income conditions of the scheme.",
    documents:
      "Birth certificate, institution certificate, income declaration, Aadhaar, and bank account in the girl's name.",
    source: "wbkanyashree.gov.in",
    officialUrl: "https://wbkanyashree.gov.in/",
    lastVerified: reference,
  },
  {
    id: "wb-oasis",
    name: "OASIS Scholarship for SC, ST and OBC (West Bengal)",
    category: "Scholarships",
    description:
      "West Bengal Backward Classes Welfare and Tribal Development portal for SC, ST, and OBC scholarships.",
    eligibility:
      "West Bengal SC, ST, and OBC students within the income limits for pre-matric and post-matric schemes.",
    documents:
      "Caste certificate, income certificate, mark sheets, institution details, Aadhaar, and bank account details.",
    source: "oasis.gov.in",
    officialUrl: "https://oasis.gov.in/",
    lastVerified: checked,
  },
  {
    id: "wb-student-credit-card",
    name: "West Bengal Student Credit Card (West Bengal)",
    category: "Scholarships",
    description:
      "West Bengal Government education loan scheme for students pursuing school, higher, professional, and competitive exam studies.",
    eligibility:
      "Students who have lived in West Bengal for the period required by the scheme, within the age limit, enrolled in eligible courses.",
    documents:
      "Residence proof, mark sheets, admission and fee details, Aadhaar, PAN if available, and bank account details.",
    source: "wbscc.wb.gov.in",
    officialUrl: "https://wbscc.wb.gov.in/",
    lastVerified: checked,
  },
  {
    id: "telangana-epass",
    name: "Telangana ePASS Scholarships (Telangana)",
    category: "Scholarships",
    description:
      "Telangana Government portal for post-matric scholarships and fee reimbursement for SC, ST, BC, EBC, minority, and disabled students.",
    eligibility:
      "Telangana students from eligible categories within the income limits, studying in recognised institutions.",
    documents:
      "Caste and income certificates, mark sheets, admission details, Aadhaar, and bank account details.",
    source: "telanganaepass.cgg.gov.in",
    officialUrl: "https://telanganaepass.cgg.gov.in/",
    lastVerified: checked,
  },
  {
    id: "ap-jnanabhumi",
    name: "Jnanabhumi Scholarships (Andhra Pradesh)",
    category: "Scholarships",
    description:
      "Andhra Pradesh Government portal for student scholarships and fee reimbursement.",
    eligibility:
      "Andhra Pradesh students meeting the category, income, and course conditions of the current schemes.",
    documents:
      "Caste and income certificates, mark sheets, admission details, Aadhaar, and bank account details.",
    source: "jnanabhumi.ap.gov.in",
    officialUrl: "https://jnanabhumi.ap.gov.in/",
    lastVerified: checked,
  },
  {
    id: "kerala-dce-scholarships",
    name: "Collegiate Education Scholarships (Kerala)",
    category: "Scholarships",
    description:
      "Kerala Directorate of Collegiate Education portal for state merit and means-based scholarships.",
    eligibility:
      "Kerala students meeting the conditions of each scholarship listed on the portal.",
    documents:
      "Mark sheets, income certificate, institution details, Aadhaar, and bank account details.",
    source: "dcescholarship.kerala.gov.in",
    officialUrl: "https://www.dcescholarship.kerala.gov.in/",
    lastVerified: reference,
  },
  {
    id: "kerala-egrantz",
    name: "e-Grantz (Kerala)",
    category: "Scholarships",
    description:
      "Kerala Government portal for educational assistance to SC, ST, OBC, and other eligible students.",
    eligibility:
      "Kerala students from eligible communities within the income limits of the scheme.",
    documents:
      "Community and income certificates, mark sheets, admission details, Aadhaar, and bank account details.",
    source: "egrantz.kerala.gov.in",
    officialUrl: "https://egrantz.kerala.gov.in/",
    lastVerified: checked,
  },
  {
    id: "gujarat-digital-gujarat-scholarship",
    name: "Digital Gujarat Scholarships (Gujarat)",
    category: "Scholarships",
    description:
      "Gujarat Government's Digital Gujarat portal for state scholarships and other citizen services.",
    eligibility:
      "Gujarat students meeting the category, income, and course conditions of each scheme.",
    documents:
      "Caste and income certificates, mark sheets, admission details, Aadhaar, and bank account details.",
    source: "digitalgujarat.gov.in",
    officialUrl: "https://www.digitalgujarat.gov.in/",
    lastVerified: checked,
  },
  {
    id: "rajasthan-sje-scholarship",
    name: "Social Justice Scholarships (Rajasthan)",
    category: "Scholarships",
    description:
      "Rajasthan Social Justice and Empowerment Department scholarships and student welfare schemes.",
    eligibility:
      "Rajasthan students from eligible categories within the income limits of each scheme.",
    documents:
      "Jan Aadhaar, caste and income certificates, mark sheets, admission details, and bank account details. Apply through SSO Rajasthan.",
    source: "sje.rajasthan.gov.in",
    officialUrl: "https://sje.rajasthan.gov.in/",
    lastVerified: checked,
  },
  {
    id: "haryana-scholarship",
    name: "Har Chhatravratti Scholarship Portal (Haryana)",
    category: "Scholarships",
    description:
      "Haryana Government's integrated scholarship portal for state and central scholarship schemes.",
    eligibility:
      "Haryana students meeting the conditions of each scheme listed on the portal.",
    documents:
      "Family ID (Parivar Pehchan Patra), mark sheets, admission details, and bank account details.",
    source: "harchhatravratti.highereduhry.ac.in",
    officialUrl: "https://harchhatravratti.highereduhry.ac.in/",
    lastVerified: checked,
  },
  {
    id: "punjab-scholarship",
    name: "Scholarship Portal (Punjab)",
    category: "Scholarships",
    description:
      "Punjab Government portal for post-matric scholarships for SC and other eligible students.",
    eligibility:
      "Punjab students from eligible categories within the income limits of the scheme.",
    documents:
      "Caste and income certificates, residence proof, mark sheets, admission details, Aadhaar, and bank account details.",
    source: "scholarships.punjab.gov.in",
    officialUrl: "https://scholarships.punjab.gov.in/",
    lastVerified: checked,
  },
  {
    id: "odisha-state-scholarship",
    name: "State Scholarship Portal (Odisha)",
    category: "Scholarships",
    description:
      "Odisha Government's single portal for state scholarships from multiple departments.",
    eligibility:
      "Odisha students meeting the category, income, and course conditions of each scheme.",
    documents:
      "Caste and income certificates, mark sheets, admission details, Aadhaar, and bank account details.",
    source: "scholarship.odisha.gov.in",
    officialUrl: "https://scholarship.odisha.gov.in/",
    lastVerified: reference,
  },
  {
    id: "jharkhand-ekalyan",
    name: "e-Kalyan Scholarships (Jharkhand)",
    category: "Scholarships",
    description:
      "Jharkhand Welfare Department portal for pre-matric and post-matric scholarships.",
    eligibility:
      "Jharkhand SC, ST, OBC, and minority students within the income limits of the scheme.",
    documents:
      "Caste, income, and residence certificates, mark sheets, admission details, Aadhaar, and bank account details.",
    source: "ekalyan.cgg.gov.in",
    officialUrl: "https://ekalyan.cgg.gov.in/",
    lastVerified: checked,
  },
  {
    id: "chhattisgarh-post-matric-scholarship",
    name: "Post-Matric Scholarship (Chhattisgarh)",
    category: "Scholarships",
    description:
      "Chhattisgarh Government portal for post-matric scholarships for SC, ST, and OBC students.",
    eligibility:
      "Chhattisgarh students from eligible categories within the income limits of the scheme.",
    documents:
      "Caste, income, and residence certificates, mark sheets, admission details, Aadhaar, and bank account details.",
    source: "postmatric-scholarship.cg.nic.in",
    officialUrl: "https://postmatric-scholarship.cg.nic.in/",
    lastVerified: checked,
  },
  {
    id: "himachal-epass",
    name: "HP e-Pass Scholarships (Himachal Pradesh)",
    category: "Scholarships",
    description:
      "Himachal Pradesh Government portal for state scholarship applications.",
    eligibility:
      "Himachal Pradesh students meeting the conditions of each scheme on the portal.",
    documents:
      "Himachali bonafide, category and income certificates, mark sheets, Aadhaar, and bank account details.",
    source: "hpepass.cgg.gov.in",
    officialUrl: "https://hpepass.cgg.gov.in/",
    lastVerified: reference,
  },
  {
    id: "tn-pudhumai-penn",
    name: "Pudhumai Penn Scheme (Tamil Nadu)",
    category: "Scholarships",
    description:
      "Tamil Nadu scheme giving monthly assistance to girls from government schools who join higher education.",
    eligibility:
      "Girl students who studied Classes 6 to 12 in Tamil Nadu government schools and joined eligible higher education courses.",
    documents:
      "School study details, college admission details, Aadhaar, and bank account details. Applications are made through the institution.",
    source: "pudhumaipenn.tn.gov.in",
    officialUrl: "https://pudhumaipenn.tn.gov.in/",
    lastVerified: reference,
  },
  // State school boards
  {
    id: "maharashtra-state-board",
    name: "Maharashtra State Board (MSBSHSE) (Maharashtra)",
    category: "Education",
    description:
      "Maharashtra State Board of Secondary and Higher Secondary Education exams, timetables, and results.",
    eligibility: "Students and schools under the Maharashtra State Board.",
    documents: "Seat number and details asked for the service.",
    source: "mahahsscboard.in",
    officialUrl: "https://www.mahahsscboard.in/",
    lastVerified: checked,
  },
  {
    id: "karnataka-kseab",
    name: "Karnataka School Examination and Assessment Board (Karnataka)",
    category: "Education",
    description: "Karnataka SSLC and II PUC exam information, notifications, and results.",
    eligibility: "Students and schools under KSEAB.",
    documents: "Registration number and details asked for the service.",
    source: "kseab.karnataka.gov.in",
    officialUrl: "https://kseab.karnataka.gov.in/",
    lastVerified: checked,
  },
  {
    id: "bihar-school-examination-board",
    name: "Bihar School Examination Board (Bihar)",
    category: "Education",
    description: "Bihar Board matric and intermediate exam registration, admit cards, and results.",
    eligibility: "Students and schools under BSEB.",
    documents: "Roll code, roll number, and details asked for the service.",
    source: "biharboardonline.bihar.gov.in",
    officialUrl: "https://biharboardonline.bihar.gov.in/",
    lastVerified: reference,
  },
  {
    id: "up-board-upmsp",
    name: "UP Board – UPMSP (Uttar Pradesh)",
    category: "Education",
    description:
      "Uttar Pradesh Madhyamik Shiksha Parishad high school and intermediate exam information and results.",
    eligibility: "Students and schools under UPMSP.",
    documents: "Roll number and details asked for the service.",
    source: "upmsp.edu.in",
    officialUrl: "https://upmsp.edu.in/",
    lastVerified: checked,
  },
  {
    id: "rajasthan-board-rbse",
    name: "Board of Secondary Education Rajasthan (Rajasthan)",
    category: "Education",
    description: "Rajasthan Board Class 10 and 12 exam information, notifications, and results.",
    eligibility: "Students and schools under RBSE.",
    documents: "Roll number and details asked for the service.",
    source: "rajeduboard.rajasthan.gov.in",
    officialUrl: "https://rajeduboard.rajasthan.gov.in/",
    lastVerified: checked,
  },
  {
    id: "gujarat-board-gseb",
    name: "Gujarat Secondary and Higher Secondary Education Board (Gujarat)",
    category: "Education",
    description: "GSEB SSC and HSC exam information, notifications, and results.",
    eligibility: "Students and schools under GSEB.",
    documents: "Seat number and details asked for the service.",
    source: "gseb.org",
    officialUrl: "https://www.gseb.org/",
    lastVerified: checked,
  },
  {
    id: "mp-board-mpbse",
    name: "Board of Secondary Education Madhya Pradesh (Madhya Pradesh)",
    category: "Education",
    description: "MP Board Class 10 and 12 exam information, notifications, and results.",
    eligibility: "Students and schools under MPBSE.",
    documents: "Roll number and details asked for the service.",
    source: "mpbse.nic.in",
    officialUrl: "https://mpbse.nic.in/",
    lastVerified: checked,
  },
  {
    id: "wb-board-wbbse",
    name: "West Bengal Board of Secondary Education (West Bengal)",
    category: "Education",
    description: "WBBSE Madhyamik exam information, notifications, and results.",
    eligibility: "Students and schools under WBBSE.",
    documents: "Roll number and details asked for the service.",
    source: "wbbse.wb.gov.in",
    officialUrl: "https://wbbse.wb.gov.in/",
    lastVerified: checked,
  },
  {
    id: "tn-government-examinations",
    name: "Directorate of Government Examinations (Tamil Nadu)",
    category: "Education",
    description: "Tamil Nadu SSLC, HSE, and other government exam information and results.",
    eligibility: "Students and private candidates appearing in Tamil Nadu government exams.",
    documents: "Registration number and details asked for the service.",
    source: "dge.tn.gov.in",
    officialUrl: "https://dge.tn.gov.in/",
    lastVerified: checked,
  },
  {
    id: "kerala-pareeksha-bhavan",
    name: "Pareeksha Bhavan (Kerala)",
    category: "Education",
    description: "Kerala Commissioner for Government Examinations: SSLC and other exam notifications and results.",
    eligibility: "Students appearing in Kerala government examinations.",
    documents: "Register number and details asked for the service.",
    source: "pareekshabhavan.kerala.gov.in",
    officialUrl: "https://pareekshabhavan.kerala.gov.in/",
    lastVerified: checked,
  },
  {
    id: "telangana-bse",
    name: "Board of Secondary Education Telangana (Telangana)",
    category: "Education",
    description: "Telangana SSC exam information, notifications, and results.",
    eligibility: "Students and schools under BSE Telangana.",
    documents: "Hall ticket number and details asked for the service.",
    source: "bse.telangana.gov.in",
    officialUrl: "https://bse.telangana.gov.in/",
    lastVerified: checked,
  },
  {
    id: "ap-bse",
    name: "Board of Secondary Education Andhra Pradesh (Andhra Pradesh)",
    category: "Education",
    description: "Andhra Pradesh SSC exam information, notifications, and results.",
    eligibility: "Students and schools under BSE AP.",
    documents: "Hall ticket number and details asked for the service.",
    source: "bse.ap.gov.in",
    officialUrl: "https://bse.ap.gov.in/",
    lastVerified: checked,
  },
  {
    id: "punjab-board-pseb",
    name: "Punjab School Education Board (Punjab)",
    category: "Education",
    description: "PSEB Class 10 and 12 exam information, notifications, and results.",
    eligibility: "Students and schools under PSEB.",
    documents: "Roll number and details asked for the service.",
    source: "pseb.ac.in",
    officialUrl: "https://www.pseb.ac.in/",
    lastVerified: checked,
  },
  {
    id: "haryana-board-bseh",
    name: "Board of School Education Haryana (Haryana)",
    category: "Education",
    description: "BSEH Class 10 and 12 exam information, notifications, and results.",
    eligibility: "Students and schools under BSEH.",
    documents: "Roll number and details asked for the service.",
    source: "bseh.org.in",
    officialUrl: "https://bseh.org.in/",
    lastVerified: checked,
  },
  {
    id: "chhattisgarh-board-cgbse",
    name: "Chhattisgarh Board of Secondary Education (Chhattisgarh)",
    category: "Education",
    description: "CGBSE Class 10 and 12 exam information, notifications, and results.",
    eligibility: "Students and schools under CGBSE.",
    documents: "Roll number and details asked for the service.",
    source: "cgbse.nic.in",
    officialUrl: "https://cgbse.nic.in/",
    lastVerified: checked,
  },
  {
    id: "jharkhand-academic-council",
    name: "Jharkhand Academic Council (Jharkhand)",
    category: "Education",
    description: "JAC matric and intermediate exam information, notifications, and results.",
    eligibility: "Students and schools under JAC.",
    documents: "Roll code, roll number, and details asked for the service.",
    source: "jac.jharkhand.gov.in",
    officialUrl: "https://jac.jharkhand.gov.in/",
    lastVerified: checked,
  },
  {
    id: "odisha-bse",
    name: "Board of Secondary Education Odisha (Odisha)",
    category: "Education",
    description: "BSE Odisha HSC exam information, notifications, and results.",
    eligibility: "Students and schools under BSE Odisha.",
    documents: "Roll number and details asked for the service.",
    source: "bseodisha.ac.in",
    officialUrl: "https://bseodisha.ac.in/",
    lastVerified: checked,
  },
  {
    id: "uttarakhand-board-ubse",
    name: "Uttarakhand Board of School Education (Uttarakhand)",
    category: "Education",
    description: "UBSE high school and intermediate exam information and results.",
    eligibility: "Students and schools under UBSE.",
    documents: "Roll number and details asked for the service.",
    source: "ubse.uk.gov.in",
    officialUrl: "https://ubse.uk.gov.in/",
    lastVerified: checked,
  },
  {
    id: "himachal-board-hpbose",
    name: "HP Board of School Education (Himachal Pradesh)",
    category: "Education",
    description: "HPBOSE Class 10 and 12 exam information, notifications, and results.",
    eligibility: "Students and schools under HPBOSE.",
    documents: "Roll number and details asked for the service.",
    source: "hpbose.org",
    officialUrl: "https://hpbose.org/",
    lastVerified: checked,
  },
  {
    id: "assam-board-seba",
    name: "Assam State School Education Board (Assam)",
    category: "Education",
    description: "Assam HSLC exam information, notifications, and results (formerly SEBA).",
    eligibility: "Students and schools under the Assam state board.",
    documents: "Roll number and details asked for the service.",
    source: "sebaonline.org",
    officialUrl: "https://site.sebaonline.org/",
    lastVerified: checked,
  },
  {
    id: "manipur-board-bosem",
    name: "Board of Secondary Education Manipur (Manipur)",
    category: "Education",
    description: "BOSEM HSLC exam information, notifications, and results.",
    eligibility: "Students and schools under BOSEM.",
    documents: "Roll number and details asked for the service.",
    source: "bosem.in",
    officialUrl: "https://bosem.in/",
    lastVerified: checked,
  },
  {
    id: "meghalaya-board-mbose",
    name: "Meghalaya Board of School Education (Meghalaya)",
    category: "Education",
    description: "MBOSE SSLC and HSSLC exam information, notifications, and results.",
    eligibility: "Students and schools under MBOSE.",
    documents: "Roll number and details asked for the service.",
    source: "mbose.in",
    officialUrl: "https://mbose.in/",
    lastVerified: checked,
  },
  // State entrance examinations
  {
    id: "maharashtra-cet-cell",
    name: "MHT CET and State CET Cell (Maharashtra)",
    category: "Education",
    description:
      "Maharashtra State Common Entrance Test Cell for MHT CET and other professional course entrance exams and admissions.",
    eligibility: "Candidates meeting the conditions for each CET and course in Maharashtra.",
    documents: "Mark sheets, domicile and category certificates as applicable, photograph, and photo ID.",
    source: "cetcell.mahacet.org",
    officialUrl: "https://cetcell.mahacet.org/",
    lastVerified: checked,
  },
  {
    id: "karnataka-kea",
    name: "Karnataka Examinations Authority (KCET) (Karnataka)",
    category: "Education",
    description:
      "Karnataka Examinations Authority entrance tests and counselling, including KCET for professional courses.",
    eligibility: "Candidates meeting the conditions in the current KEA notification.",
    documents: "Mark sheets, eligibility certificates for Karnataka quota, category certificates, and photo ID.",
    source: "cetonline.karnataka.gov.in",
    officialUrl: "https://cetonline.karnataka.gov.in/kea/",
    lastVerified: checked,
  },
  {
    id: "wbjee-board",
    name: "WBJEE Board (West Bengal)",
    category: "Education",
    description:
      "West Bengal Joint Entrance Examinations Board exams and counselling for engineering, pharmacy, and other courses.",
    eligibility: "Candidates meeting the conditions in the current WBJEEB notification.",
    documents: "Mark sheets, domicile and category certificates as applicable, photograph, and photo ID.",
    source: "wbjeeb.nic.in",
    officialUrl: "https://wbjeeb.nic.in/",
    lastVerified: reference,
  },
  {
    id: "kerala-cee-keam",
    name: "Commissioner for Entrance Examinations – KEAM (Kerala)",
    category: "Education",
    description:
      "Kerala entrance exams and centralised allotment for engineering, medical, architecture, and pharmacy courses.",
    eligibility: "Candidates meeting the conditions in the current KEAM prospectus.",
    documents: "Mark sheets, nativity and community certificates as applicable, photograph, and photo ID.",
    source: "cee.kerala.gov.in",
    officialUrl: "https://cee.kerala.gov.in/",
    lastVerified: checked,
  },
  {
    id: "tamil-nadu-tnea",
    name: "Tamil Nadu Engineering Admissions (TNEA) (Tamil Nadu)",
    category: "Education",
    description:
      "Single-window counselling for engineering admissions in Tamil Nadu, based on Class 12 marks.",
    eligibility: "Candidates meeting the conditions in the current TNEA information brochure.",
    documents: "Class 10 and 12 mark sheets, nativity and community certificates, and photo ID.",
    source: "tneaonline.org",
    officialUrl: "https://www.tneaonline.org/",
    lastVerified: checked,
  },
  {
    id: "odisha-ojee",
    name: "Odisha Joint Entrance Examination (OJEE) (Odisha)",
    category: "Education",
    description:
      "Odisha entrance exam and counselling for professional courses in state institutions.",
    eligibility: "Candidates meeting the conditions in the current OJEE notification.",
    documents: "Mark sheets, residence and category certificates as applicable, photograph, and photo ID.",
    source: "ojee.nic.in",
    officialUrl: "https://ojee.nic.in/",
    lastVerified: checked,
  },
];
