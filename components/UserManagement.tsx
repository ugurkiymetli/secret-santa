/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import {
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  Crown,
} from "lucide-react";
import { User } from "./types";
import { toast } from "react-hot-toast";
import { span } from "framer-motion/client";

interface UserManagementProps {
  users: User[];
  onRefresh: () => void;
}

export function UserManagement({ users, onRefresh }: UserManagementProps) {
  const [newUser, setNewUser] = useState("");
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const handleCopyUsernameAndLoginLink = (
    name: string,
    username: string,
    userId: string
  ) => {
    if (typeof window === "undefined") return;

    const emojis = ["🎄", "🎅", "🎁", "✨", "❄️", "⛄", "🦌", "🎉"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const loginLink = `${window.location.origin}/login`;
    const wishes = [
      "Mutlu yıllar! 🎁",
      "Yeni yılınız kutlu olsun! 🎉",
      "Harika bir yıl dileriz! ✨",
      "Umut dolu bir yıl olsun! 🥳",
      "Sağlık, mutluluk ve başarılarla dolu bir yıl olsun! 🎄",
    ];
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];

    const text = `Selam ${name}! ${randomEmoji}

Seni de yılbaşı çekilişimize bekliyoruz! 🥳

Senin için oluşturduğumuz kullanıcı adı: 
    ${username}

Aşağıdaki linkten giriş yapabilirsin, unutma ilk girişte hesabını aktifleştirmen gerekiyor:
    ${loginLink}

${randomWish}

`;
    navigator.clipboard.writeText(text);
    setCopiedUserId(userId);
    setTimeout(() => setCopiedUserId(null), 2000);
    toast.success("Davet mesajı kopyalandı!");
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser) return;

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newUser }),
    });

    if (res.ok) {
      setNewUser("");
      onRefresh();
      toast.success("Yeni katılımcı eklendi!");
    }
  };

  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const deleteUser = async (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    await fetch(`/api/admin/users?id=${userToDelete._id}`, {
      method: "DELETE",
    });
    onRefresh();
    toast.success(`${userToDelete.name}(${userToDelete.username}) silindi!`);
  };

  return (
    <Card className="border-white/10 shadow-white/5 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-white" />
          Katılımcıları Yönet
        </CardTitle>
        <CardDescription>Tüm katılımcıları ekle veya çıkar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={createUser} className="flex gap-2">
          <Input
            placeholder="Katılımcı Adı"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
          />
          <Button type="submit">
            <UserPlus className="w-4 h-4 mr-2" /> Ekle
          </Button>
        </form>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {users
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
            .map((user, index) => {
              const colors = [
                "bg-red-500",
                "bg-green-500",
                "bg-emerald-500",
                "bg-blue-500",
                "bg-purple-500",
              ];
              const color = colors[index % colors.length];

              return (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/10 group hover:bg-black/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-white/20`}
                    >
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((word) => word.charAt(0).toUpperCase())
                            .join("")
                            .slice(0, 3)
                        : user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-white leading-none flex items-center gap-1">
                        {user.name || user.username}
                        {user.isActivated && (
                          <span title="Kullanıcı aktif">
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1 mt-1 group/copy">
                        <span className="text-[10px] text-white/50 font-mono">
                          {user.username}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 text-white/30 hover:text-white/80"
                          onClick={() =>
                            handleCopyUsernameAndLoginLink(
                              user.name,
                              user.username,
                              user._id
                            )
                          }
                          title="Davet metnini kopyala"
                        >
                          {copiedUserId === user._id ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80 flex items-center gap-1">
                      {user.role === "ORGANIZER" && (
                        <Crown className="w-3 h-3 text-yellow-500" />
                      )}
                      {user.role === "ORGANIZER" ? "ORGANİZATÖR" : "KATILIMCI"}
                    </span>
                    {user.role !== "ORGANIZER" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-400 bg-red-900/20 hover:bg-red-900/40"
                        onClick={() => deleteUser(user)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          {users.length === 0 && (
            <p className="text-center text-white/50 py-4">
              Henüz katılımcı yok
            </p>
          )}
        </div>
      </CardContent>

      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Katılımcıyı Sil"
        message={`${userToDelete?.name} (${userToDelete?.username}) silinsin mi?`}
        variant="danger"
        confirmText="Sil"
      />
    </Card>
  );
}
