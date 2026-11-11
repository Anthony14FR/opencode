import { describe, expect, test } from "bun:test"
import type { SessionInboxInfo } from "@opencode/client/promise"
import { queuedPromptAttachments, queuedPromptRows } from "./queue"

const queued = [
  {
    id: "msg_original",
    sessionID: "ses_1",
    time: { created: 1 },
    type: "user",
    delivery: "queue",
    payload: { text: "original" },
  },
  {
    id: "msg_replacement",
    sessionID: "ses_1",
    time: { created: 2 },
    type: "user",
    delivery: "queue",
    payload: { text: "edited" },
  },
] satisfies SessionInboxInfo[]

describe("queuedPromptRows", () => {
  test("renders prompts in queue order", () => {
    expect(queuedPromptRows(queued)).toEqual(
      queued.map((item) => ({ id: item.id, text: item.payload.text, attachments: 0 })),
    )
  })
})

describe("queuedPromptAttachments", () => {
  test("returns inline attachments as composer image parts", () => {
    const item = {
      ...queued[0],
      payload: {
        text: "",
        files: [
          { data: "aGk=", mime: "image/png", source: { type: "inline" as const }, name: "shot.png" },
          { data: "aGk=", mime: "application/pdf", source: { type: "inline" as const } },
        ],
      },
    } satisfies SessionInboxInfo

    expect(queuedPromptAttachments(item)).toEqual([
      {
        type: "image",
        id: "msg_original:file:0",
        filename: "shot.png",
        mime: "image/png",
        blob: { id: "data:image/png;base64,aGk=", url: "data:image/png;base64,aGk=" },
      },
      {
        type: "image",
        id: "msg_original:file:1",
        filename: "attachment",
        mime: "application/pdf",
        blob: { id: "data:application/pdf;base64,aGk=", url: "data:application/pdf;base64,aGk=" },
      },
    ])
  })
})
