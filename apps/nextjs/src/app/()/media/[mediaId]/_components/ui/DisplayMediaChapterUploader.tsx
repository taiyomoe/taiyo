import Link from "next/link";
import { UserIcon } from "lucide-react";

import type { User } from "@taiyo/db/types/user.types";

type Props = {
  user: User;
};

export const DisplayMediaChapterUploader = ({ user }: Props) => {
  return (
    <div className="flex items-center gap-1">
      <UserIcon size={20} />
      <Link
        className="hover:bg-content3 rounded px-2"
        href={`/users/${user.id}`}
      >
        <p>{user.name}</p>
      </Link>
    </div>
  );
};
