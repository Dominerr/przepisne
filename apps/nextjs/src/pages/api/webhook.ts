import type { IncomingHttpHeaders } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { WebhookRequiredHeaders } from "svix";

import { Webhook } from "svix";
import { trpc } from "../../utils/trpc";

const webhookSecret: string = process.env.WEBHOOK_SECRET ?? "";

export default async function handler(
  req: NextApiRequestWithSvixRequiredHeaders,
  res: NextApiResponse,
) {
  const payload = JSON.stringify(req.body);
  const headers = req.headers;
  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(webhookSecret);
  console.log(webhookSecret);

  let evt: any;
  try {
    // Verify the webhook payload and headers
    evt = wh.verify(payload, headers) as any;
  } catch (_) {
    // If the verification fails, return a 400 error
    return res.status(400).json({});
  }
  const { id } = evt.data;

  const eventType = evt.type;
  if (eventType === "user.created") {
    console.log(`User ${id} was ${eventType}`);
    const { mutateAsync } = trpc.auth.createUser.useMutation();
    await mutateAsync({ id });
  }

  if (eventType === "user.deleted") {
    console.log(`User ${id} was ${eventType}`);
    res.status(201).json({});
    const { mutateAsync } = trpc.auth.deleteUser.useMutation();
    await mutateAsync({ id });
  }
}

type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
  headers: IncomingHttpHeaders & WebhookRequiredHeaders;
};
