import { Comment } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findIdsFromText } from "@/utils/find-ids-from-text";
import * as ticketData from "../data";

export const disconnectReferencedTicketsViaComment = async (
  commentIdOrComment: Comment | string
) => {
  const comment =
    typeof commentIdOrComment === "string"
      ? await prisma.comment.findUnique({
          where: {
            id: commentIdOrComment,
          },
        })
      : commentIdOrComment;

  if (!comment) {
    throw new Error("Comment not found !!!");
  }

  const ticketIds = findIdsFromText("tickets", comment.content);

  if (!ticketIds.length) return;

  const comments = await prisma.comment.findMany({
    where: {
      ticketId: comment.ticketId,
      id: {
        not: comment.id,
      },
    },
  });

  const allOtherTicketIds = findIdsFromText(
    "tickets",
    comments.map((comment) => comment.content).join(" ")
  );

  const ticketIdsToRemove = ticketIds.filter(
    (ticketId) => !allOtherTicketIds.includes(ticketId)
  );

  await ticketData.disconnectReferencedTickets(
    comment.ticketId,
    ticketIdsToRemove
  );
};
