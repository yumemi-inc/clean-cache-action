import { exit } from 'node:process';

import { error, getInput, warning } from '@actions/core';
import { context } from '@actions/github';
import { type RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { Octokit } from '@octokit/rest';
import fetch from 'node-fetch';

const getInputRequired = (name: string) =>
  getInput(name, {
    required: true,
  });

const getInputOptional = (name: string) => {
  const i = getInput(name);
  return i === '' ? undefined : i;
};

(async () => {
  const ref = getInputOptional('ref');
  const key = getInputOptional('key');

  const octokit = new Octokit({
    baseUrl: context.apiUrl,
    auth: getInputRequired('token'),
    request: {
      fetch,
    },
  });

  let page = 1;
  let caches: RestEndpointMethodTypes['actions']['getActionsCacheList']['response'];
  do {
    console.log(
      `🔍 Retrieving cache list from GitHub Actions... (Page ${page})`,
    );

    caches = await octokit.actions.getActionsCacheList({
      ...context.repo,
      ref,
      key,
      page,
      per_page: 100,
    });

    if (page++ === 1 && caches.data.actions_caches.length === 0) {
      console.log('✨ No caches found, looks shine!');
      break;
    }

    for (const cache of caches.data.actions_caches) {
      if (!cache.id) {
        warning('⚠️ Malformed response, skipping');
        continue;
      }

      await octokit.actions.deleteActionsCacheById({
        ...context.repo,
        cache_id: cache.id,
      });

      console.log(
        `✅ Successfully deleted cache '${cache.key}' (${cache.size_in_bytes} bytes)`,
      );
    }
  } while (caches.data.total_count > caches.data.actions_caches.length);
})()
  .then()
  .catch((e) => {
    error(`❌ ${e}`);
    exit(1);
  });
