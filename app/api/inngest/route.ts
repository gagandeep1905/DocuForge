import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { ingestProject } from '@/inngest/functions';

export const maxDuration = 300; // large repos can take a while to download and unzip

export const { GET, POST, PUT } = serve({ client: inngest, functions: [ingestProject] });
