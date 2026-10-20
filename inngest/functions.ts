import { NonRetriableError } from 'inngest';
import { inngest } from './client';
import { supabaseAdmin } from '../lib/supabase';
import { runIngest } from '../lib/ingest/pipeline';
import { IngestError } from '../lib/ingest/errors';

const GENERIC_ERROR = 'Something went wrong while reading your project. Please try again.';

export const ingestProject = inngest.createFunction(
  {
    id: 'ingest-project',
    retries: 2,
    concurrency: { limit: 5 },
    // Runs after all retries are exhausted. Keeps a specific message if one was already saved.
    onFailure: async ({ event }) => {
      const projectId = event.data.event.data.projectId as string;
      await supabaseAdmin
        .from('projects')
        .update({ status: 'failed', error: GENERIC_ERROR })
        .eq('id', projectId)
        .neq('status', 'failed');
    },
  },
  { event: 'project/created' },
  async ({ event, step }) => {
    const projectId = event.data.projectId as string;

    const coverage = await step.run('ingest', async () => {
      try {
        return await runIngest(projectId);
      } catch (e) {
        if (e instanceof IngestError) {
          // User-fixable problem: save the friendly message and don't retry.
          await supabaseAdmin.from('projects').update({ status: 'failed', error: e.message }).eq('id', projectId);
          throw new NonRetriableError(e.message);
        }
        console.error('ingest failed', projectId, e);
        throw e; // transient: let Inngest retry
      }
    });

    // Week 2 listens for this to start summarization and Project Model building.
    await step.sendEvent('ingested', { name: 'project/ingested', data: { projectId } });
    return coverage;
  },
);
