-- ============================================================
--  FUMBLE - Sports & Entertainment Management System
-- ============================================================
-- SECTION 1: TABLE CREATION WITH CONSTRAINTS
-- ============================================================

-- 1. USERS
CREATE TABLE Users (
    user_id       INT PRIMARY KEY IDENTITY(1,1),
    roll_number   VARCHAR(20) UNIQUE,
    first_name    VARCHAR(50) NOT NULL,
    last_name     VARCHAR(50) NOT NULL,
    email         VARCHAR(100) UNIQUE,
    phone         VARCHAR(20),
    role          VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'organizer')),
    created_at    DATETIME DEFAULT GETDATE()
);

-- 2. SPORTS
CREATE TABLE Sports (
    sport_id      INT PRIMARY KEY IDENTITY(1,1),
    sport_name    VARCHAR(20) NOT NULL UNIQUE CHECK (sport_name IN ('Football', 'Basketball', 'Cricket')),
    max_team_size INT NOT NULL,
    min_team_size INT NOT NULL
);

-- 3. VENUES
CREATE TABLE Venues (
    venue_id      INT PRIMARY KEY IDENTITY(1,1),
    venue_name    VARCHAR(100) NOT NULL,
    sport_id      INT NOT NULL,
    location      VARCHAR(100),
    capacity      INT,
    is_available  BIT DEFAULT 1,
    FOREIGN KEY (sport_id) REFERENCES Sports(sport_id)
);

-- 4. COURT REGISTRATIONS
CREATE TABLE Court_Registrations (
    booking_id    INT PRIMARY KEY IDENTITY(1,1),
    user_id       INT NOT NULL,
    venue_id      INT,
    booking_date  DATE NOT NULL,
    start_time    TIME NOT NULL,
    end_time      TIME NOT NULL,
    status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at    DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id)  REFERENCES Users(user_id),
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id)
);

-- 5. SPORTS ITEMS
CREATE TABLE Sports_Items (
    item_id       INT PRIMARY KEY IDENTITY(1,1),
    item_name     VARCHAR(100) NOT NULL,
    sport_id      INT,
    total_qty     INT NOT NULL DEFAULT 0,
    FOREIGN KEY (sport_id) REFERENCES Sports(sport_id)
);

-- 6. ITEM ISSUANCE
CREATE TABLE Item_Issuance (
    issuance_id   INT PRIMARY KEY IDENTITY(1,1),
    user_id       INT NOT NULL,
    item_id       INT NOT NULL,
    quantity      INT NOT NULL DEFAULT 1,
    issued_at     DATETIME DEFAULT GETDATE(),
    due_date      DATE NOT NULL,
    returned_at   DATETIME DEFAULT NULL,
    status        VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue')),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (item_id) REFERENCES Sports_Items(item_id),
    CONSTRAINT chk_quantity CHECK (quantity > 0)
);

-- 7. TEAMS
CREATE TABLE Teams (
    team_id       INT PRIMARY KEY IDENTITY(1,1),
    team_name     VARCHAR(100) NOT NULL,
    sport_id      INT NOT NULL,
    captain_id    INT NOT NULL,
    created_at    DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (sport_id)   REFERENCES Sports(sport_id),
    FOREIGN KEY (captain_id) REFERENCES Users(user_id)
);

-- 8. TEAM MEMBERS
CREATE TABLE Team_Members (
    member_id     INT PRIMARY KEY IDENTITY(1,1),
    team_id       INT NOT NULL,
    user_id       INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES Teams(team_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT unique_team_member UNIQUE (team_id, user_id)
);

-- 9. TOURNAMENTS
CREATE TABLE Tournaments (
    tournament_id INT PRIMARY KEY IDENTITY(1,1),
    name          VARCHAR(150) NOT NULL,
    sport_id      INT NOT NULL,
    organizer_id  INT NOT NULL,
    start_date    DATE,
    end_date      DATE,
    venue_id      INT,
    status        VARCHAR(20) DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'ongoing', 'completed', 'cancelled')),
    FOREIGN KEY (sport_id)     REFERENCES Sports(sport_id),
    FOREIGN KEY (organizer_id) REFERENCES Users(user_id),
    FOREIGN KEY (venue_id)     REFERENCES Venues(venue_id)
);

-- 10. TOURNAMENT REGISTRATIONS
CREATE TABLE Tournament_Registrations (
    reg_id        INT PRIMARY KEY IDENTITY(1,1),
    tournament_id INT NOT NULL,
    team_id       INT NOT NULL,
    registered_at DATETIME DEFAULT GETDATE(),
    status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'disqualified')),
    FOREIGN KEY (tournament_id) REFERENCES Tournaments(tournament_id),
    FOREIGN KEY (team_id)       REFERENCES Teams(team_id),
    CONSTRAINT unique_team_tournament UNIQUE (tournament_id, team_id)
);

-- 11. MATCHES
CREATE TABLE Matches (
    match_id      INT PRIMARY KEY IDENTITY(1,1),
    tournament_id INT DEFAULT NULL,
    team_a_id     INT NOT NULL,
    team_b_id     INT NOT NULL,
    match_date    DATE,
    match_time    TIME,
    winner_id     INT DEFAULT NULL,
    status        VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    FOREIGN KEY (tournament_id) REFERENCES Tournaments(tournament_id),
    FOREIGN KEY (team_a_id)     REFERENCES Teams(team_id),
    FOREIGN KEY (team_b_id)     REFERENCES Teams(team_id),
    FOREIGN KEY (winner_id)     REFERENCES Teams(team_id),
    CONSTRAINT chk_teams_diff CHECK (team_a_id <> team_b_id)
);

-- 12. PLAYER PROFILES
CREATE TABLE Player_Profiles (
    profile_id    INT PRIMARY KEY IDENTITY(1,1),
    user_id       INT NOT NULL,
    sport_id      INT NOT NULL,
    skill_level   VARCHAR(20) DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'pro')),
    position      VARCHAR(50),
    is_available  BIT DEFAULT 1,
    bio           TEXT,
    FOREIGN KEY (user_id)  REFERENCES Users(user_id),
    FOREIGN KEY (sport_id) REFERENCES Sports(sport_id),
    CONSTRAINT unique_player_sport UNIQUE (user_id, sport_id)
);

-- ============================================================
-- SECTION 2: DUMMY DATA
-- ============================================================

-- Sports
INSERT INTO Sports (sport_name, max_team_size, min_team_size) VALUES
('Football',   11, 7),
('Basketball',  5, 5),
('Cricket',    11, 8);

-- Users
INSERT INTO Users (roll_number, first_name, last_name, email, phone, role) VALUES
('L24-2557', 'Azan', 'Wasty',    'azan.wasty@nu.edu.pk',    '03001111111', 'student'),
('L24-2540', 'Mahareb', 'Ammar', 'mahareb.ammar@nu.edu.pk', '03002222222', 'student'),
('L24-2579', 'Ali', 'Naveed',    'ali.naveed@nu.edu.pk',    '03003333333', 'student'),
('L24-2606', 'Saaif', 'Suleman', 'saaif.suleman@nu.edu.pk', '03004444444', 'student'),
('A00-0001', 'Sports', 'Admin',  'sports.admin@nu.edu.pk',  '03005555555', 'admin'),
('L24-2600', 'Hamza', 'Raza',    'hamza.raza@nu.edu.pk',    '03006666666', 'student'),
('L24-2601', 'Sara', 'Khan',     'sara.khan@nu.edu.pk',     '03007777777', 'student'),
('L24-2602', 'Bilal', 'Tariq',   'bilal.tariq@nu.edu.pk',   '03008888888', 'student'),
('L24-2603', 'Fatima', 'Malik',  'fatima.malik@nu.edu.pk',  '03009999999', 'student'),
('L24-2604', 'Usman', 'Ghani',   'usman.ghani@nu.edu.pk',   '03011111111', 'organizer');

-- Venues
INSERT INTO Venues (venue_name, sport_id, location, capacity, is_available) VALUES
('Main Football Ground',    1, 'Block A Grounds', 20, 1),
('Indoor Basketball Court', 2, 'Sports Complex',  15, 1),
('Main Cricket Pitch',      3, 'Block B Grounds', 22, 1);

-- Sports Items
INSERT INTO Sports_Items (item_name, sport_id, total_qty) VALUES
('Football',     1, 10),
('Basketball',   2,  8),
('Cricket Bat',  3, 12),
('Cricket Ball', 3, 20);

-- Teams
INSERT INTO Teams (team_name, sport_id, captain_id) VALUES
('Thunder FC',    1, 1),
('Night Owls FC', 1, 6),
('Hoops Crew',    2, 3),
('Fast Breakers', 2, 7),
('Storm XI',      3, 2),
('Pace Warriors', 3, 9);

-- Team Members
INSERT INTO Team_Members (team_id, user_id) VALUES
(1, 1),
(1, 6),
(1, 8),
(2, 6),
(2, 9),
(3, 3),
(3, 7),
(3, 4),
(4, 7),
(4, 10),
(5, 2),
(5, 9),
(5, 10),
(6, 8),
(6, 4);

-- Court Registrations
INSERT INTO Court_Registrations (user_id, venue_id, booking_date, start_time, end_time, status) VALUES
(1, 1, '2026-03-10', '08:00:00', '10:00:00', 'confirmed'),
(6, 2, '2026-03-10', '14:00:00', '16:00:00', 'confirmed'),
(3, 3, '2026-03-11', '10:00:00', '12:00:00', 'confirmed'),
(7, 2, '2026-03-11', '14:00:00', '16:00:00', 'pending'),
(2, 3, '2026-03-12', '08:00:00', '12:00:00', 'confirmed'),
(9, 3, '2026-03-12', '15:00:00', '17:00:00', 'cancelled'),
(1, 1, '2026-03-14', '16:00:00', '18:00:00', 'pending');

-- Item Issuance
INSERT INTO Item_Issuance (user_id, item_id, quantity, issued_at, due_date, returned_at, status) VALUES
(1, 1, 1, '2026-03-01 09:00:00', '2026-03-05', '2026-03-05 10:00:00', 'returned'),
(2, 3, 2, '2026-03-02 10:00:00', '2026-03-06', '2026-03-06 09:00:00', 'returned'),
(3, 2, 1, '2026-03-05 11:00:00', '2026-03-08', NULL,                  'overdue'),
(4, 4, 2, '2026-03-06 12:00:00', '2026-03-09', NULL,                  'issued'),
(6, 1, 1, '2026-03-07 08:00:00', '2026-03-10', NULL,                  'issued'),
(8, 3, 3, '2026-03-07 09:00:00', '2026-03-12', NULL,                  'issued');

-- Tournaments
INSERT INTO Tournaments (name, sport_id, organizer_id, start_date, end_date, venue_id, status) VALUES
('Spring Football Cup 2026',   1, 10, '2026-03-20', '2026-04-05', 1, 'approved'),
('Basketball Bonanza 2026',    2, 10, '2026-03-25', '2026-04-10', 2, 'proposed'),
('Cricket League Spring 2026', 3,  5, '2026-03-18', '2026-04-20', 3, 'approved');

-- Tournament Registrations
INSERT INTO Tournament_Registrations (tournament_id, team_id, status) VALUES
(1, 1, 'confirmed'),
(1, 2, 'confirmed'),
(2, 3, 'confirmed'),
(2, 4, 'pending'),
(3, 5, 'confirmed'),
(3, 6, 'confirmed');

-- Matches
INSERT INTO Matches (tournament_id, team_a_id, team_b_id, match_date, match_time, winner_id, status) VALUES
(1,    1, 2, '2026-03-20', '15:00:00', 1,    'completed'),
(2,    3, 4, '2026-03-25', '10:00:00', NULL, 'scheduled'),
(3,    5, 6, '2026-03-18', '09:00:00', NULL, 'scheduled'),
(NULL, 1, 2, '2026-03-08', '16:00:00', NULL, 'completed');

-- Player Profiles
INSERT INTO Player_Profiles (user_id, sport_id, skill_level, position, is_available, bio) VALUES
(1,  1, 'advanced',     'Striker',        1, 'Fast winger, 3 years experience'),
(2,  3, 'intermediate', 'Batsman',        1, 'Right-hand opening batsman'),
(3,  2, 'advanced',     'Point Guard',    0, 'Team captain, strong playmaker'),
(4,  3, 'intermediate', 'Wicket Keeper',  1, 'Agile behind the stumps'),
(6,  1, 'intermediate', 'Midfielder',     1, 'Defensive mid, good stamina'),
(7,  2, 'beginner',     'Shooting Guard', 1, 'New to basketball, eager to improve'),
(8,  1, 'intermediate', 'Defender',       1, 'Centre-back, strong in tackles'),
(9,  3, 'advanced',     'Bowler',         0, 'Fast bowler, 130+ km/h'),
(10, 1, 'pro',          'All-rounder',    1, 'Plays at district level');

-- ============================================================
-- SECTION 3: QUERIES (SEARCH / UPDATE / DELETE)
-- ============================================================

-- ----- SELECT / SEARCH -----

-- Q1: View all confirmed court bookings with user and venue/sport details
SELECT
    cr.booking_id,
    u.first_name,
    u.last_name,
    u.roll_number,
    v.venue_name,
    s.sport_name,
    cr.booking_date,
    cr.start_time,
    cr.end_time,
    cr.status
FROM Court_Registrations cr
JOIN Users  u ON cr.user_id  = u.user_id
JOIN Venues v ON cr.venue_id = v.venue_id
JOIN Sports s ON v.sport_id  = s.sport_id
WHERE cr.status = 'confirmed'
ORDER BY cr.booking_date, cr.start_time;

-- Q2: Search available players for Football
SELECT
    u.first_name,
    u.last_name,
    u.roll_number,
    pp.skill_level,
    pp.position,
    pp.bio
FROM Player_Profiles pp
JOIN Users  u ON pp.user_id  = u.user_id
JOIN Sports s ON pp.sport_id = s.sport_id
WHERE s.sport_name = 'Football' AND pp.is_available = 1;

-- Q3: View all teams and their members for Basketball
SELECT
    t.team_name,
    u.first_name,
    u.last_name,
    u.roll_number
FROM Teams t
JOIN Team_Members tm ON t.team_id  = tm.team_id
JOIN Users        u  ON tm.user_id = u.user_id
JOIN Sports       s  ON t.sport_id = s.sport_id
WHERE s.sport_name = 'Basketball';

-- Q4: Find opponent Football teams (excluding your own)
SELECT
    t.team_id,
    t.team_name,
    u.first_name + ' ' + u.last_name AS captain_name
FROM Teams t
JOIN Users u ON t.captain_id = u.user_id
WHERE t.sport_id = 1 AND t.team_id <> 1;

-- Q5: All currently unreturned items (issued or overdue)
SELECT
    ii.issuance_id,
    u.first_name,
    u.last_name,
    u.roll_number,
    si.item_name,
    ii.quantity,
    ii.issued_at,
    ii.due_date,
    ii.status
FROM Item_Issuance ii
JOIN Users        u  ON ii.user_id = u.user_id
JOIN Sports_Items si ON ii.item_id = si.item_id
WHERE ii.status IN ('issued', 'overdue')
ORDER BY ii.due_date;

-- Q6: View tournament registrations for Spring Football Cup
SELECT
    t.name AS tournament_name,
    tm.team_name,
    u.first_name + ' ' + u.last_name AS captain,
    tr.status
FROM Tournament_Registrations tr
JOIN Tournaments t  ON tr.tournament_id = t.tournament_id
JOIN Teams       tm ON tr.team_id       = tm.team_id
JOIN Users       u  ON tm.captain_id    = u.user_id
WHERE t.name = 'Spring Football Cup 2026';

-- Q7: View completed match results
SELECT
    m.match_id,
    ta.team_name AS team_a,
    tb.team_name AS team_b,
    tw.team_name AS winner,
    m.match_date
FROM Matches m
JOIN Teams ta ON m.team_a_id  = ta.team_id
JOIN Teams tb ON m.team_b_id  = tb.team_id
LEFT JOIN Teams tw ON m.winner_id = tw.team_id
WHERE m.status = 'completed';

-- Q8: Stock check for all Cricket items
SELECT
    si.item_name,
    si.total_qty,
    (si.total_qty - ISNULL(SUM(ii.quantity), 0)) AS available_qty,
    ISNULL(SUM(ii.quantity), 0) AS currently_issued
FROM Sports_Items si
JOIN Sports s ON si.sport_id = s.sport_id
LEFT JOIN Item_Issuance ii ON si.item_id = ii.item_id AND ii.status IN ('issued', 'overdue')
WHERE s.sport_name = 'Cricket'
GROUP BY si.item_id, si.item_name, si.total_qty;

-- ----- UPDATE -----

-- U1: Confirm a pending court booking
UPDATE Court_Registrations
SET status = 'confirmed'
WHERE booking_id = 4 AND status = 'pending';

-- U2: Mark an issued item as returned and log return time
UPDATE Item_Issuance
SET status = 'returned', returned_at = GETDATE()
WHERE issuance_id = 3;

-- U3: Restore available quantity after item return (REMOVED: derived attribute)
-- UPDATE Sports_Items SET available_qty = available_qty + 1 WHERE item_id = 4;

-- U4: Approve a proposed tournament
UPDATE Tournaments
SET status = 'approved'
WHERE tournament_id = 2;

-- U5: Record match winner after completion
UPDATE Matches
SET winner_id = 3, status = 'completed'
WHERE match_id = 2;

-- U6: Mark a player as unavailable (injured / busy)
UPDATE Player_Profiles
SET is_available = 0
WHERE user_id = 1;

-- ----- DELETE -----

-- D1: Delete a pending court booking
DELETE FROM Court_Registrations
WHERE booking_id = 7 AND status = 'pending';

-- D2: Remove a player from a team roster
DELETE FROM Team_Members
WHERE team_id = 2 AND user_id = 9;

-- D3: Remove a team's tournament registration (team withdrew)
DELETE FROM Tournament_Registrations
WHERE tournament_id = 2 AND team_id = 4;




--Users � linked to Court_Registrations, Item_Issuance, Teams, Tournaments, Player_Profiles
--Sports � linked to Venues, Sports_Items, Teams, Tournaments, Player_Profiles
--Venues - linked to Court_Registrations, Tournaments
--Court_Registrations � linked to Users, Venues
--Sports_Items � linked to Item_Issuance
--Item_Issuance � linked to Users, Sports_Items
--Teams � linked to Team_Members, Tournament_Registrations, Matches, Tournaments
--Team_Members � linked to Teams, Users
--Tournaments � linked to Sports, Users, Venues, Tournament_Registrations, Matches
--Tournament_Registrations � linked to Tournaments, Teams
--Matches � linked to Tournaments, Teams (�3 � team_a, team_b, winner)
--Player_Profiles � linked to Users, Sports
ALTER TABLE Users ADD password_hash VARCHAR(255);