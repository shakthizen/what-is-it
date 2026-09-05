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

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: string;
  status: FeatureStatus;
  progress: number; // 0-100
  order: number;
}

export interface Task {
  id: string;
  featureId: string;
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

export interface UIGuidelines {
  layout?: string;
  colors?: string[];
  typography?: string;
  responsive?: string;
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
  tasks: Task[];
  wiki: WikiPage[];
  flows: UserFlow[];
}
