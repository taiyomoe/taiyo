import Link from "next/link";
import { UserIcon } from "lucide-react";

import type { User } from "@taiyo/db/types/user.types";

type Props = {
  user: User;
};

export const DisplayMediaChapterUploader = ({ user }: Props) => {
  return (
    <div className="flex w-full items-center gap-1 bg-green-100">
      <UserIcon size={20} />
      <Link
        className="hover:bg-content3 select-none rounded bg-blue-100 px-2 text-sm"
        href={`/users/${user.id}`}
      >
        <p>{user.name}</p>
      </Link>
    </div>
  );
};
