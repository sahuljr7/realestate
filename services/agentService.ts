import type { Agent } from '@/types/index';
import agentsData from '@/data/agents.json';

const agents: Agent[] = agentsData as Agent[];

export function getAllAgents(): Agent[] {
  return agents;
}

export function getAgentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}
