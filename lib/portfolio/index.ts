import { assertPortfolioIntegrity } from './integrity'

assertPortfolioIntegrity()

export type {
  ContactInfo,
  Credential,
  CredentialSection,
  CredentialStatus,
  EducationEntry,
  EducationStatus,
  ExperienceEntry,
  PortfolioInternalAppId,
  Profile,
  Project,
  ProjectAction,
  ProjectCategory,
  ProjectLink,
  ProjectLinkKind,
  ProjectMedia,
  ProjectMetric,
  ProjectStatus,
  SeoCopy,
  SkillGroup,
} from './types'

export { PROFILE, PROFILE_LINKS } from './profile'
export { PROJECTS } from './projects'
export { EDUCATION } from './education'
export { EXPERIENCE } from './experience'
export { SKILL_GROUPS } from './skills'
export { CREDENTIALS } from './credentials'
export { SEO_COPY } from './seo'
export {
  CASE_STUDIES,
  CASE_STUDY_PROJECT_IDS,
  defaultCaseStudyReturnTarget,
  getCaseStudy,
  getCaseStudyHash,
  getCaseStudySectionDomId,
  getNextCaseStudyId,
  isCaseStudyProjectId,
  parseCaseStudyHash,
  type CaseStudy,
  type CaseStudyOrigin,
  type CaseStudyProjectId,
  type CaseStudyTone,
} from './case-studies'
export {
  findSkillGroup,
  getCompletedCredentials,
  getCredentialById,
  getCurrentEducation,
  getFeaturedProjects,
  getFeaturedProjectActions,
  getProjectEvidence,
  getInProgressCredentials,
  getPlannedCredentials,
  getPriorEducation,
  getProjectActions,
  getProjectById,
  getProjectsWithInternalApps,
  getSkillAreas,
  getSpotlightProjects,
  listUniqueTechnologies,
  type ResolvedProjectAction,
} from './selectors'
export {
  formatAssistantKnowledgeContext,
  formatCredentialsBrief,
  formatEducationBrief,
  formatExperienceBrief,
  formatFeaturedProjectsBrief,
  formatProfileBrief,
  formatProjectBrief,
  formatSkillsBrief,
} from './format'
