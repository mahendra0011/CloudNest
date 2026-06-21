function isAdminCredentials(email, password) {
    if (!email || password === undefined || password === null) {
        return false;
    }

    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '';

    if (!adminEmail || !adminPassword) {
        return false;
    }

    return email.trim().toLowerCase() === adminEmail && password === adminPassword;
}

function isAdminEmail(email) {
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (!adminEmail) return false;
    return email.trim().toLowerCase() === adminEmail;
}

function resolveRole(email, password) {
    return isAdminCredentials(email, password) ? 'admin' : 'user';
}

module.exports = {
    isAdminCredentials,
    isAdminEmail,
    resolveRole
};
