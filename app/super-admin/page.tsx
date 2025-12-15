"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Calendar, Shield, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import toast from "react-hot-toast";

interface Admin {
  _id: string;
  username: string;
  name: string;
  createdAt: string;
}

interface Event {
  _id: string;
  name: string;
  status: string;
  organizerId: {
    name: string;
    username: string;
  };
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  username: string;
  createdBy: {
    name: string;
    username: string;
  };
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"admins" | "events" | "users">("admins");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === "admins") {
        res = await fetch("/api/super-admin/admins");
      } else if (activeTab === "events") {
        res = await fetch("/api/super-admin/events");
      } else {
        res = await fetch("/api/super-admin/users");
      }

      if (res.status === 401) {
        router.push("/");
        return;
      }

      const data = await res.json();
      if (activeTab === "admins") setAdmins(data.admins);
      else if (activeTab === "events") setEvents(data.events);
      else setUsers(data.users);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      const res = await fetch(`/api/super-admin/admins?id=${adminToDelete._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Admin ve ilişkili tüm veriler silindi");
        setAdmins(admins.filter((a) => a._id !== adminToDelete._id));
      } else {
        const data = await res.json();
        toast.error(data.error || "Silme işlemi başarısız");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Super Admin Dashboard
            </h1>
            <p className="text-white/60 mt-1">Sistem yönetimi ve izleme</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
            <LogOut className="w-5 h-5 mr-2" />
            Çıkış Yap
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("admins")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === "admins"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Shield className="w-5 h-5" />
            Adminler
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === "events"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar className="w-5 h-5" />
            Etkinlikler
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === "users"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-5 h-5" />
            Kullanıcılar
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-white/40">Yükleniyor...</div>
          ) : (
            <>
              {activeTab === "admins" && (
                <>
                  {/* Mobile Card View */}
                  <div className="grid gap-4 md:hidden">
                    {admins.map((admin) => (
                      <Card key={admin._id} className="flex justify-between items-center p-6">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{admin.name}</h3>
                          <p className="text-white/60">@{admin.username}</p>
                          <p className="text-xs text-white/40 mt-1">
                            Kayıt: {new Date(admin.createdAt).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          onClick={() => {
                            setAdminToDelete(admin);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <table className="w-full text-left text-sm text-white/70">
                      <thead className="bg-white/5 text-white font-medium">
                        <tr>
                          <th className="px-6 py-4">İsim</th>
                          <th className="px-6 py-4">Kullanıcı Adı</th>
                          <th className="px-6 py-4">Kayıt Tarihi</th>
                          <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {admins.map((admin) => (
                          <tr key={admin._id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">{admin.name}</td>
                            <td className="px-6 py-4">@{admin.username}</td>
                            <td className="px-6 py-4">
                              {new Date(admin.createdAt).toLocaleDateString("tr-TR")}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8 p-0"
                                onClick={() => {
                                  setAdminToDelete(admin);
                                  setDeleteModalOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {admins.length === 0 && (
                    <div className="text-center py-12 text-white/40">Hiç admin bulunamadı.</div>
                  )}
                </>
              )}

              {activeTab === "events" && (
                <>
                  {/* Mobile Card View */}
                  <div className="grid gap-4 md:hidden">
                    {events.map((event) => (
                      <Card key={event._id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                            <p className="text-white/60">
                              Organizator: {event.organizerId?.name} (@{event.organizerId?.username})
                            </p>
                            <p className="text-xs text-white/40 mt-1">
                              Oluşturulma: {new Date(event.createdAt).toLocaleDateString("tr-TR")}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              event.status === "COMPLETED"
                                ? "bg-green-500/20 text-green-300"
                                : event.status === "ACTIVE"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <table className="w-full text-left text-sm text-white/70">
                      <thead className="bg-white/5 text-white font-medium">
                        <tr>
                          <th className="px-6 py-4">Etkinlik Adı</th>
                          <th className="px-6 py-4">Organizator</th>
                          <th className="px-6 py-4">Durum</th>
                          <th className="px-6 py-4 text-right">Oluşturulma</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {events.map((event) => (
                          <tr key={event._id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">{event.name}</td>
                            <td className="px-6 py-4">
                              {event.organizerId?.name} <span className="text-white/40">(@{event.organizerId?.username})</span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  event.status === "COMPLETED"
                                    ? "bg-green-500/20 text-green-300"
                                    : event.status === "ACTIVE"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-yellow-500/20 text-yellow-300"
                                }`}
                              >
                                {event.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {new Date(event.createdAt).toLocaleDateString("tr-TR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {events.length === 0 && (
                    <div className="text-center py-12 text-white/40">Hiç etkinlik bulunamadı.</div>
                  )}
                </>
              )}

              {activeTab === "users" && (
                <>
                  {/* Mobile Card View */}
                  <div className="grid gap-4 md:hidden">
                    {users.map((user) => (
                      <Card key={user._id} className="p-6">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                          <p className="text-white/60">@{user.username}</p>
                          <p className="text-sm text-white/50 mt-1">
                            Oluşturan: {user.createdBy?.name} (@{user.createdBy?.username})
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <table className="w-full text-left text-sm text-white/70">
                      <thead className="bg-white/5 text-white font-medium">
                        <tr>
                          <th className="px-6 py-4">İsim</th>
                          <th className="px-6 py-4">Kullanıcı Adı</th>
                          <th className="px-6 py-4">Oluşturan</th>
                          <th className="px-6 py-4 text-right">Kayıt Tarihi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                            <td className="px-6 py-4">@{user.username}</td>
                            <td className="px-6 py-4">
                              {user.createdBy?.name} <span className="text-white/40">(@{user.createdBy?.username})</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {users.length === 0 && (
                    <div className="text-center py-12 text-white/40">Hiç kullanıcı bulunamadı.</div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAdmin}
        title="Admini Sil"
        message={`"${adminToDelete?.name}" adlı admini silmek istediğinize emin misiniz? Bu işlem adminin oluşturduğu TÜM ETKİNLİKLERİ ve KULLANICILARI da silecektir. Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        variant="danger"
      />
    </div>
  );
}
