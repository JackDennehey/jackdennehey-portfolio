import { assertSpotlightIntegrity } from './integrity'

assertSpotlightIntegrity()

export { buildSpotlightIndex } from './build-index'
export {
  getSpotlightEmptyState,
  groupSpotlightResults,
  limitGroupedResults,
  querySpotlight,
} from './query'
export { describeSpotlightAction } from './integrity'
export { PORTFOLIO_SECTION_DOM_IDS } from './types'
export type {
  PortfolioSectionId,
  SpotlightAction,
  SpotlightEntry,
  SpotlightGroup,
  SpotlightKind,
  SpotlightQueryResult,
  SpotlightResult,
  SpotlightSystemCommand,
} from './types'
