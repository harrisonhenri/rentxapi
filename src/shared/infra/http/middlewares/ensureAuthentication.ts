import { Response, Request, NextFunction } from "express";
import { verify } from "jsonwebtoken";

import { UsersRepository } from "@modules/accounts/infra/typeorm/repositories/UsesRepository";
import { AppError } from "@shared/errors/AppError";

export async function ensureAuthentication(
  request: Request,
  _: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) throw new AppError("Token missing", 401);

  const [, token] = authHeader.split(" ");

  try {
    const { sub: user_id } = verify(token, "0af0b64569cde8182e0235cb7243e817");

    const usersRepository = new UsersRepository();

    const user = await usersRepository.findById(user_id as string);

    if (!user) throw new AppError("User does not exists", 401);

    request.user_id = user_id as string;

    next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
}