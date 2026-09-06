export type ProjectType = 'web' | 'mobile' | 'api' | 'cli' | 'monorepo' | 'library' | 'unknown';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type FeatureStatus = 'planned' | 'in_progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectMeta {
  name: string;
  description: string;
  projectType: ProjectType;
  frameworks: string[];
  architectureSummary: string;
  version: string;
  updatedAt: string;
  overallProgress: number; // 0-100
}

export type ImplementationStatus = 'implemented' | 'in_progress' | 'missing';

export interface RoleBasedAction {
  id: string;
  actorRole: string; // e.g. 'Guest', 'User', 'Admin', 'Developer'
  action: string;
  status: ImplementationStatus;
  targetScreenOrEndpoint?: string;
  notes?: string;
}

export interface UserStory {
  id: string;
  actorRole: string; // e.g. 'Guest', 'User', 'Admin', 'Developer'
  story: string;     // "As a [role], I want to [goal] so that [benefit]"
  status: ImplementationStatus;
  acceptanceCriteria?: string[];
}

export interface PlannedGapDetails {
  whatsMissing: string[];
  why: string;
  how: string;
  where: string[];
  when: string;
}

export interface SubFeature {
  id: string;
  title: string;
  description?: string;
  status: ImplementationStatus;
  what: string;   // Capability description
  why: string;    // Rationale / problem solved
  how: string;    // Technical approach / implementation
  where: string;  // Target files, routes, or modules
  when: string;   // Milestone or phase
  roleActions?: RoleBasedAction[];
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: string;
  status: FeatureStatus;
  progress: number; // 0-100
  order: number;
  subFeatures: SubFeature[];
  userStories?: UserStory[];
  roleActions?: RoleBasedAction[];
  missingDetails?: PlannedGapDetails;
}

export interface Task {
  id: string;
  featureId: string;
  subFeatureId?: string; // Links this legacy task to the SubFeature it mirrors, so completing it can flip real progress
  title: string;
  status: TaskStatus;
  priority: Priority;
  actorRole: string; // e.g. 'User', 'Admin', 'Guest', 'Developer', 'System'
  why: string;       // Rationale / problem solved
  how: string;       // Technical approach, patterns, libraries
  where: string;     // Exact file paths, routes, directories, components
  when: string;      // Milestone, phase, order, dependencies
  completedAt?: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  title: string;
  level: number;
}

export interface WikiPage {
  id: string;
  title: string;
  category: string;
  order: number;
  content: string; // Markdown
  bookmarks: Bookmark[];
  lastModified: string;
}

export type FrameType = 'desktop' | 'mobile' | 'modal' | 'component';

export interface UIStateSpecs {
  empty?: string;
  loading?: string;
  error?: string;
}

export interface UIGuidelines {
  layout?: string;
  colors?: string[];
  typography?: string;
  responsive?: string;
  spacing?: string;
  components?: string[];
  accessibility?: string[];
  states?: UIStateSpecs;
  interactionRules?: string[];
  specs?: string[];
}

export interface VisualContentBlock {
  type: 'stat' | 'card' | 'list' | 'chart' | 'form' | 'table' | 'hero' | 'tabs';
  label: string;
  height?: number;
  details?: string;
}

export interface VisualLayoutBlueprint {
  headerTitle?: string;
  navItems?: string[];
  contentBlocks?: VisualContentBlock[];
  bottomNav?: string[];
  sidebarItems?: string[];
}

export interface FlowNodeData {
  title: string;
  subtitle?: string;
  actorRole?: string;
  frameType?: FrameType;
  uiGuidelines?: UIGuidelines;
  visualLayout?: VisualLayoutBlueprint;
  /**
   * Agent-generated inline SVG markup (a single <svg>...</svg> string) representing the
   * actual mockup for this screen. When present, frame node components render this instead
   * of their generic built-in wireframe template. Sanitized before render (no <script>,
   * event handler attributes, or javascript: URIs) since it can arrive via untrusted import.
   */
  mockupSvg?: string;
  actions?: Array<{ label: string; targetNodeId: string; type?: string }>;
  notes?: string;
}

export interface FlowNode {
  id: string;
  type: 'desktopFrame' | 'mobileFrame' | 'modalFrame' | 'actorNode' | 'decisionNode' | 'actionNode';
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface UserFlow {
  id: string;
  title: string;
  actorRole: string; // e.g. 'Guest', 'User', 'Admin'
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface ProjectData {
  schemaVersion: number;
  meta: ProjectMeta;
  features: Feature[];
  tasks?: Task[];
  wiki: WikiPage[];
  flows: UserFlow[];
}

/**
 * Structural guard for untrusted incoming payloads (HTTP API body, `import` file).
 * Not a full JSON-Schema validation — just enough shape-checking to reject garbage
 * before it gets zlib-compressed and persisted as the project's source of truth.
 */
export function validateProjectData(value: unknown): value is ProjectData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, any>;
  if (typeof v.schemaVersion !== 'number') return false;
  if (!v.meta || typeof v.meta !== 'object') return false;
  if (typeof v.meta.name !== 'string' || typeof v.meta.projectType !== 'string') return false;
  if (!Array.isArray(v.features)) return false;
  if (!Array.isArray(v.wiki)) return false;
  if (!Array.isArray(v.flows)) return false;
  if (v.tasks !== undefined && !Array.isArray(v.tasks)) return false;

  for (const f of v.features) {
    if (!f || typeof f !== 'object') return false;
    if (typeof f.id !== 'string' || typeof f.title !== 'string') return false;
    if (f.subFeatures !== undefined && !Array.isArray(f.subFeatures)) return false;
  }
  for (const w of v.wiki) {
    if (!w || typeof w !== 'object') return false;
    if (typeof w.id !== 'string' || typeof w.content !== 'string') return false;
  }
  return true;
}

export function getProjectJsonSchema(): Record<string, any> {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'ProjectData',
    type: 'object',
    required: ['schemaVersion', 'meta', 'features', 'wiki', 'flows'],
    properties: {
      schemaVersion: { type: 'number', default: 1 },
      meta: {
        type: 'object',
        required: ['name', 'description', 'projectType', 'frameworks', 'version'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          projectType: { type: 'string', enum: ['web', 'mobile', 'api', 'cli', 'monorepo', 'library', 'unknown'] },
          frameworks: { type: 'array', items: { type: 'string' } },
          architectureSummary: { type: 'string' },
          version: { type: 'string' },
          overallProgress: { type: 'number' }
        }
      },
      features: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'title', 'category', 'status', 'progress', 'subFeatures'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            status: { type: 'string', enum: ['planned', 'in_progress', 'completed'] },
            progress: { type: 'number' },
            order: { type: 'number' },
            subFeatures: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'title', 'status', 'what', 'why', 'how', 'where', 'when'],
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['implemented', 'in_progress', 'missing'] },
                  what: { type: 'string' },
                  why: { type: 'string' },
                  how: { type: 'string' },
                  where: { type: 'string' },
                  when: { type: 'string' }
                }
              }
            },
            userStories: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'actorRole', 'story', 'status'],
                properties: {
                  id: { type: 'string' },
                  actorRole: { type: 'string' },
                  story: { type: 'string' },
                  status: { type: 'string', enum: ['implemented', 'in_progress', 'missing'] },
                  acceptanceCriteria: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            roleActions: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'actorRole', 'action', 'status'],
                properties: {
                  id: { type: 'string' },
                  actorRole: { type: 'string' },
                  action: { type: 'string' },
                  status: { type: 'string', enum: ['implemented', 'in_progress', 'missing'] },
                  targetScreenOrEndpoint: { type: 'string' },
                  notes: { type: 'string' }
                }
              }
            },
            missingDetails: {
              type: 'object',
              properties: {
                whatsMissing: { type: 'array', items: { type: 'string' } },
                why: { type: 'string' },
                how: { type: 'string' },
                where: { type: 'array', items: { type: 'string' } },
                when: { type: 'string' }
              }
            }
          }
        }
      },
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'featureId', 'title', 'status', 'why', 'how', 'where', 'when'],
          properties: {
            id: { type: 'string' },
            featureId: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'blocked'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            actorRole: { type: 'string' },
            why: { type: 'string', description: 'Rationale / business value' },
            how: { type: 'string', description: 'Technical approach / implementation' },
            where: { type: 'string', description: 'File paths / components / routes' },
            when: { type: 'string', description: 'Milestone / phase / priority' }
          }
        }
      },
      wiki: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'title', 'category', 'content', 'bookmarks'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            category: { type: 'string' },
            content: { type: 'string', description: 'Markdown content with headings and code' },
            bookmarks: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'title', 'level'],
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  level: { type: 'number' }
                }
              }
            }
          }
        }
      },
      flows: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'title', 'actorRole', 'nodes', 'edges'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            actorRole: { type: 'string' },
            description: { type: 'string' },
            nodes: { type: 'array' },
            edges: { type: 'array' }
          }
        }
      }
    }
  };
}

