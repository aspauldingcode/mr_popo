import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [offenses, setOffenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/user')
            .then(res => res.json())
            .then(data => {
                setUser(data);
                if (data) fetchOffenses();
            })
            .finally(() => setLoading(false));
    }, []);

    const fetchOffenses = () => {
        fetch('/api/offenses')
            .then(res => res.json())
            .then(setOffenses);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                    <img src="/assets/images/MR_POPO.png" alt="Mr. Popo Logo" className="w-12 h-12 rounded-full border-2 border-purple-500" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        MR_POPO Dashboard
                    </h1>
                </div>
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-slate-400">Welcome, {user.username}</span>
                        <a href="/api/logout" className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition">
                            Logout
                        </a>
                    </div>
                ) : (
                    <a href="/auth/discord" className="bg-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-500 transition">
                        Login with Discord
                    </a>
                )}
            </header>

            {user && (
                <main className="grid gap-8">
                    <div className="bg-slate-800/50 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="p-4">User ID</th>
                                    <th className="p-4">Offenses</th>
                                    <th className="p-4">Last Offense</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offenses.length > 0 ? offenses.map(offense => (
                                    <tr key={offense.user_id} className="border-b border-white/5 last:border-0">
                                        <td className="p-4 font-mono text-sm">{offense.user_id}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${offense.count >= 3 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {offense.count} / 3
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm">{offense.last_offense_date}</td>
                                        <td className="p-4">
                                            <button className="text-blue-400 hover:underline">Reset</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-500">No offenses tracked yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            )}
        </div>
    );
};

export default Dashboard;
