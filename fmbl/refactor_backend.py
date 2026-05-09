import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    if 'players.controller.js' in filepath:
        content = content.replace('u.full_name', 'u.first_name, u.last_name')
        # Wait, if it's "u.full_name, u.roll_number", replacing u.full_name -> u.first_name, u.last_name will result in "u.first_name, u.last_name, u.roll_number".
        # This works perfectly.
    elif 'teams.controller.js' in filepath:
        # SELECT ... u.full_name AS captain_name
        # we can't just do u.first_name, u.last_name AS captain_name. We need (u.first_name + ' ' + u.last_name) AS captain_name.
        content = content.replace('u.full_name AS captain_name', "(u.first_name + ' ' + u.last_name) AS captain_name")
    elif 'tournaments.controller.js' in filepath:
        # SELECT ... u.full_name AS organizer_name
        content = content.replace('u.full_name AS organizer_name', "(u.first_name + ' ' + u.last_name) AS organizer_name")

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    target_dir = r"c:\\Users\\WASTY\\Documents\\DB-lab\\fmbl\\backend\\controllers"
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith('.js'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
