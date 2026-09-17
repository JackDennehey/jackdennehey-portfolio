import type { BlueOceanLaunchContext } from '@/lib/blue-ocean'
import {
  COMMAND_PALETTE_APP_IDS,
  WINDOW_APPS,
  type WindowId,
} from './apps'
import type { JackOsCommand } from './command-palette'

export type OpenAppCommandOptions = {
  launchContext?: BlueOceanLaunchContext
}

export function buildAppOpenCommands(
  openWindow: (id: WindowId, options?: OpenAppCommandOptions) => void,
): JackOsCommand[] {
  return COMMAND_PALETTE_APP_IDS.map((id) => {
    const app = WINDOW_APPS[id]
    return {
      id: `open-${id}`,
      title: app.commandTitle ?? `Open ${app.title}`,
      subtitle:
        app.commandSubtitle ??
        (app.description ? `Application / ${app.description}` : 'Application'),
      keywords: [app.title, id, ...(app.keywords ?? [])],
      Icon: app.Icon,
      tone: app.tone,
      iconVisual: app.iconVisual,
      ariaLabel: app.commandAriaLabel,
      action: () =>
        openWindow(
          id,
          id === 'blue-ocean' ? { launchContext: 'search' } : undefined,
        ),
    }
  })
}
