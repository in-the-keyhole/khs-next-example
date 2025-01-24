import { getServerAuthHandler, getServerSession } from "@keyhole/services/AuthService";
import { NextRequest, NextResponse } from "next/server";

export const baseHandler = async (req: NextRequest) => {
  const session = await getServerSession();

  if (session) {
    return NextResponse.json({
      content: `This is a protected api. You can access this api because you are signed in as ${session.user.email}.`,
    });
  } else {
    return NextResponse.json({
      content:
        "You must be signed in to view the protected content on this page.",
    });
  }
};

export const authHandler = await getServerAuthHandler();