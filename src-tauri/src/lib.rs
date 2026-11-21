use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_study_tables",
        sql: r#"
            CREATE TABLE IF NOT EXISTS word_progress (
                word_id TEXT PRIMARY KEY, ease REAL NOT NULL DEFAULT 2.5,
                interval_days INTEGER NOT NULL DEFAULT 0, repetitions INTEGER NOT NULL DEFAULT 0,
                due_at INTEGER NOT NULL DEFAULT 0, last_reviewed INTEGER NOT NULL DEFAULT 0,
                correct_count INTEGER NOT NULL DEFAULT 0, incorrect_count INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS review_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT, word_id TEXT NOT NULL,
                quality INTEGER NOT NULL, created_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_review_log_created_at ON review_log(created_at);
            CREATE TABLE IF NOT EXISTS quiz_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT, mode TEXT NOT NULL,
                score INTEGER NOT NULL, total INTEGER NOT NULL,
                duration_seconds INTEGER NOT NULL, created_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY, value TEXT NOT NULL
            );
        "#,
        kind: MigrationKind::Up,
    }];
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default()
            .add_migrations("sqlite:nihongo-master-n4.db", migrations).build())
        .run(tauri::generate_context!())
        .expect("Failed to launch Nihongo Master N4");
}
