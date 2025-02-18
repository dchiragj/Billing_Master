import { connectDB, sql } from "@/db";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    // console.log("Login request received", email, password);
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Email and password are required",
        }),
        { status: 400 }
      );
    }

    const pool = await connectDB();

    const result = await pool
      .request()
      .input("UserName", sql.VarChar, email)
      .query(
        "SELECT * FROM Master_Users WHERE UserId = @UserName or EmailId=@UserName"
      );
    // console.log("Result:", result);

    if (result.recordset.length === 0) {
      return new Response(
        JSON.stringify({ status: false, message: "User not found" }),
        { status: 401 }
      );
    }

    const user = result?.recordset?.[0];
    const isMatch = password === user.LastPwd ? true : false;
    const userDetails = {
      UserId: user.UserId,
      UserName: user.UserName,
      Email: user.EmailId,
    };

    if (!isMatch) {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Invalid username or password",
        }),
        { status: 401 }
      );
    }

    const token = "";
    // const token = jwt.sign(
    //   { id: user.Id, email: user.Email },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1h" }
    // );

    return new Response(
      JSON.stringify({
        status: true,
        token,
        message: "Login successful",
        data: userDetails,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ status: false, message: "Server error" }),
      { status: 500 }
    );
  }
}
