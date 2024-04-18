import { authOptions } from "@keyhole/config/auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

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

export { handler as GET, handler as POST };
