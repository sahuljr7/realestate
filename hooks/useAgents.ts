'use client';

import { useState } from 'react';
import { getAllAgents } from '@/services/agentService';
import type { Agent } from '@/types/index';

export function useAgents(): {
  agents: Agent[];
  loading: boolean;
} {
  const [loading] = useState(false);
  const agents = getAllAgents();

  return { agents, loading };
}
