"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button, Card, CardBody, CardTitle, Input } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

type HealthStats = {
  stats: {
    users: number;
    families: number;
    books: number;
    newUsersLast24h: number;
    errorsLast24h: number;
  };
  backupStatus: string;
  errorTracking: string;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  isActive: boolean;
  createdAt: string;
  family?: { id: string; name: string } | null;
};

type AdminFamily = {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
  _count: { users: number; books: number };
};

type AdminBook = {
  id: string;
  title: string;
  author: string;
  isAvailable: boolean;
  createdAt: string;
  family: { id: string; name: string };
};

type AuditEntry = {
  id: string;
  action: string;
  targetUserId?: string | null;
  targetFamilyId?: string | null;
  targetBookId?: string | null;
  createdAt: string;
  actorUser: { id: string; name: string; email: string };
};

export default function AdminPage() {
  const { dbUser } = useAuth();
  const { t } = useLocale();
  const [pageLoading, setPageLoading] = useState(true);
  const [health, setHealth] = useState<HealthStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [families, setFamilies] = useState<AdminFamily[]>([]);
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [familySearch, setFamilySearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [emptyFamiliesOnly, setEmptyFamiliesOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    const response = await fetch("/api/admin/health");
    if (!response.ok) {
      throw new Error("Failed to load health stats");
    }
    const data = await response.json();
    setHealth(data);
  };

  const fetchUsers = async () => {
    const params = new URLSearchParams();
    if (userSearch) {
      params.set("search", userSearch);
    }
    const response = await fetch(`/api/admin/users?${params}`);
    if (!response.ok) {
      throw new Error("Failed to load users");
    }
    const data = await response.json();
    setUsers(data.users || []);
  };

  const fetchFamilies = async () => {
    const params = new URLSearchParams();
    if (familySearch) {
      params.set("search", familySearch);
    }
    if (emptyFamiliesOnly) {
      params.set("empty", "true");
    }
    const response = await fetch(`/api/admin/families?${params}`);
    if (!response.ok) {
      throw new Error("Failed to load families");
    }
    const data = await response.json();
    setFamilies(data.families || []);
  };

  const fetchBooks = async () => {
    const params = new URLSearchParams();
    if (bookSearch) {
      params.set("search", bookSearch);
    }
    const response = await fetch(`/api/admin/books?${params}`);
    if (!response.ok) {
      throw new Error("Failed to load books");
    }
    const data = await response.json();
    setBooks(data.books || []);
  };

  const fetchAudit = async () => {
    const response = await fetch("/api/admin/audit");
    if (!response.ok) {
      throw new Error("Failed to load audit log");
    }
    const data = await response.json();
    setAudits(data.audits || []);
  };

  const refreshAll = async () => {
    setError(null);
    try {
      await Promise.all([fetchHealth(), fetchUsers(), fetchFamilies(), fetchBooks(), fetchAudit()]);
    } catch (err) {
      setError("Failed to load admin data.");
    }
  };

  useEffect(() => {
    if (!dbUser) {
      return;
    }

    if (dbUser.role !== "ADMIN") {
      setPageLoading(false);
      return;
    }

    refreshAll().finally(() => setPageLoading(false));
  }, [dbUser]);

  const updateUser = async (id: string, payload: { role?: "ADMIN" | "MEMBER"; isActive?: boolean }) => {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to update user");
    }
  };

  const handleRoleToggle = async (user: AdminUser) => {
    setError(null);
    try {
      await updateUser(user.id, { role: user.role === "ADMIN" ? "MEMBER" : "ADMIN" });
      await Promise.all([fetchUsers(), fetchAudit()]);
    } catch (err) {
      setError("Failed to update role.");
    }
  };

  const handleActiveToggle = async (user: AdminUser) => {
    setError(null);
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      await Promise.all([fetchUsers(), fetchAudit()]);
    } catch (err) {
      setError("Failed to update user status.");
    }
  };

  const handleDeleteFamily = async (familyId: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/families/${familyId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete family");
      }
      await Promise.all([fetchFamilies(), fetchAudit()]);
    } catch (err) {
      setError("Failed to delete family.");
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete book");
      }
      await Promise.all([fetchBooks(), fetchAudit()]);
    } catch (err) {
      setError("Failed to delete book.");
    }
  };

  if (!dbUser || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-500">{t('loading')}</p>
        </main>
      </div>
    );
  }

  if (dbUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardBody>
              <CardTitle>{t('accessRestricted')}</CardTitle>
              <p className="text-sm text-gray-600">{t('accessRestrictedDesc')}</p>
            </CardBody>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('adminTitle')}</h1>
          <p className="text-gray-600">{t('adminSubtitle')}</p>
        </div>

        {error && (
          <Card>
            <CardBody>
              <p className="text-sm text-red-600">{error}</p>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody>
            <CardTitle>{t('healthTitle')}</CardTitle>
            {health ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">{t('usersLabel')}</p>
                  <p className="text-lg font-semibold text-gray-900">{health.stats.users}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('familiesLabel')}</p>
                  <p className="text-lg font-semibold text-gray-900">{health.stats.families}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('booksLabel')}</p>
                  <p className="text-lg font-semibold text-gray-900">{health.stats.books}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('newUsersLabel')}</p>
                  <p className="text-lg font-semibold text-gray-900">{health.stats.newUsersLast24h}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('errorsLabel')}</p>
                  <p className="text-lg font-semibold text-gray-900">{health.stats.errorsLast24h}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('backupStatusLabel')}</p>
                  <p className="text-sm font-medium text-gray-700">{health.backupStatus}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('errorTrackingLabel')}</p>
                  <p className="text-sm font-medium text-gray-700">{health.errorTracking}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Loading health stats...</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <CardTitle>{t('usersLabel')}</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <Input
                  label={t('searchUsersLabel')}
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder={t('searchUsersPlaceholder')}
                />
                <Button size="sm" variant="secondary" onClick={fetchUsers}>
                  {t('search')}
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-2">{t('fullNameLabel')}</th>
                    <th className="py-2">{t('emailLabel')}</th>
                    <th className="py-2">{t('roleLabel')}</th>
                    <th className="py-2">{t('statusText')}</th>
                    <th className="py-2">{t('actionsLabel')}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="py-2">{user.name}</td>
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">{user.role}</td>
                      <td className="py-2">{user.isActive ? t('statusActive') : t('statusInactive')}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRoleToggle(user)}
                          >
                            {user.role === "ADMIN" ? t('demote') : t('promote')}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleActiveToggle(user)}
                          >
                            {user.isActive ? t('deactivate') : t('activate')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">
                        {t('usersNone')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <CardTitle>{t('familiesLabel')}</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <Input
                  label={t('searchFamilies')}
                  value={familySearch}
                  onChange={(event) => setFamilySearch(event.target.value)}
                  placeholder={t('searchFamiliesPlaceholder')}
                />
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={emptyFamiliesOnly}
                    onChange={(event) => {
                      setEmptyFamiliesOnly(event.target.checked);
                    }}
                  />
                  {t('emptyFamiliesOnly')}
                </label>
                <Button size="sm" variant="secondary" onClick={fetchFamilies}>
                  {t('search')}
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-2">{t('familyNameLabel')}</th>
                    <th className="py-2">{t('familyAddressLabel')}</th>
                    <th className="py-2">{t('membersLabel')}</th>
                    <th className="py-2">{t('booksLabel')}</th>
                    <th className="py-2">{t('actionsLabel')}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {families.map((family) => (
                    <tr key={family.id} className="border-t">
                      <td className="py-2">{family.name}</td>
                      <td className="py-2">{family.address}</td>
                      <td className="py-2">{family._count.users}</td>
                      <td className="py-2">{family._count.books}</td>
                      <td className="py-2">
                        {family._count.users === 0 ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDeleteFamily(family.id)}
                          >
                            {t('delete')}
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">{t('notEmpty')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {families.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">
                        {t('familiesNone')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <CardTitle>{t('booksLabel')}</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <Input
                  label={t('searchBooks')}
                  value={bookSearch}
                  onChange={(event) => setBookSearch(event.target.value)}
                  placeholder={t('searchBooksPlaceholder')}
                />
                <Button size="sm" variant="secondary" onClick={fetchBooks}>
                  {t('search')}
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-2">{t('titleLabel')}</th>
                    <th className="py-2">{t('authorLabel')}</th>
                    <th className="py-2">{t('familyLabel')}</th>
                    <th className="py-2">{t('statusLabel')}</th>
                    <th className="py-2">{t('actionsLabel')}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {books.map((book) => (
                    <tr key={book.id} className="border-t">
                      <td className="py-2">{book.title}</td>
                      <td className="py-2">{book.author}</td>
                      <td className="py-2">{book.family.name}</td>
                      <td className="py-2">{book.isAvailable ? t('available') : t('borrowed')}</td>
                      <td className="py-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          {t('remove')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {books.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">
                        {t('booksNone')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle>{t('auditLog')}</CardTitle>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-2">{t('auditWhen')}</th>
                    <th className="py-2">{t('auditActor')}</th>
                    <th className="py-2">{t('auditAction')}</th>
                    <th className="py-2">{t('auditTarget')}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {audits.map((entry) => (
                    <tr key={entry.id} className="border-t">
                      <td className="py-2">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2">
                        {entry.actorUser.name} ({entry.actorUser.email})
                      </td>
                      <td className="py-2">{entry.action}</td>
                      <td className="py-2">
                        {entry.targetUserId || entry.targetFamilyId || entry.targetBookId || "-"}
                      </td>
                    </tr>
                  ))}
                  {audits.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
                        {t('auditNone')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
