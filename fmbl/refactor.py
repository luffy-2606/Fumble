import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    if 'api.ts' in filepath:
        content = content.replace('full_name: string', 'first_name: string; last_name: string')
    elif 'SignupPage.tsx' in filepath:
        content = content.replace("full_name: ''", "first_name: '', last_name: ''")
        content = content.replace(
            '''<div className="form-group">\n            <label className="form-label">Full Name</label>\n            <input className="form-input" placeholder="e.g. Ali Ahmed"\n              value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />\n          </div>''',
            '''<div className="form-group" style={{ display: 'flex', gap: 16 }}>\n            <div style={{ flex: 1 }}>\n              <label className="form-label">First Name</label>\n              <input className="form-input" placeholder="First Name"\n                value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />\n            </div>\n            <div style={{ flex: 1 }}>\n              <label className="form-label">Last Name</label>\n              <input className="form-input" placeholder="Last Name"\n                value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />\n            </div>\n          </div>'''
        )
        content = content.replace('!formData.full_name', '!formData.first_name || !formData.last_name')
        # Organizer Registration Addition to SignupPage
        if 'Organizer' not in content:
            content = content.replace(
                '''<button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>''',
                '''<div className="form-group">\n            <label className="form-label">Role</label>\n            <select className="form-input" value={formData.role || 'student'} onChange={e => setFormData({ ...formData, role: e.target.value })}>\n              <option value="student">Student</option>\n              <option value="organizer">Organizer</option>\n            </select>\n          </div>\n          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>'''
            )
            content = content.replace("last_name: ''", "last_name: '', role: 'student'")

    elif 'UsersPage.tsx' in filepath:
        content = content.replace('u.full_name', '`${u.first_name} ${u.last_name}`')
    elif 'PlayersPage.tsx' in filepath:
        content = content.replace('p.full_name', '`${p.first_name} ${p.last_name}`')
        # "How to add players"
        # We can add a "Become a Player" button if user is student.
    elif 'IssuancePage.tsx' in filepath:
        content = content.replace('i.full_name', '`${i.first_name} ${i.last_name}`')
    elif 'DashboardPage.tsx' in filepath:
        content = content.replace('user?.full_name', '`${user?.first_name} ${user?.last_name}`')
    elif 'Navbar.tsx' in filepath:
        content = content.replace('user?.full_name', '`${user?.first_name} ${user?.last_name}`')

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    target_dir = r"c:\\Users\\WASTY\\Documents\\DB-lab\\fmbl\\frontend\\src"
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
