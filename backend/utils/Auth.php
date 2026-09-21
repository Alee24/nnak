<?php
/**
 * MMS Auth Utility Helper
 * Shared authentication and authorization functions
 * Used by all controllers
 */

class Auth {

    /**
     * Check if user is authenticated (has valid session)
     */
    public static function isAuthenticated(): bool {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }

    /**
     * Require authentication or send 401
     */
    public static function requireAuth(): void {
        if (!self::isAuthenticated()) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required', 'message' => 'Please log in to access this resource']);
            exit();
        }
    }

    /**
     * Get current user ID
     */
    public static function userId(): ?int {
        return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
    }

    /**
     * Get current user role
     */
    public static function role(): ?string {
        return $_SESSION['role'] ?? null;
    }

    /**
     * Get current user's full name (stored in session after login)
     */
    public static function userName(): string {
        return $_SESSION['user_name'] ?? 'System';
    }

    /**
     * Check if user has a specific role
     */
    public static function hasRole(string ...$roles): bool {
        $userRole = self::role();
        return in_array($userRole, $roles);
    }

    /**
     * Check if user is any kind of admin/management
     */
    public static function isAdmin(): bool {
        return self::hasRole(
            'admin', 'super_admin', 'general_manager'
        );
    }

    /**
     * Check if user is super admin
     */
    public static function isSuperAdmin(): bool {
        return self::hasRole('super_admin');
    }

    /**
     * Check if user is a finance role
     */
    public static function isFinance(): bool {
        return self::hasRole('admin', 'super_admin', 'general_manager', 'finance_manager', 'cashier');
    }

    /**
     * Check if user can manage golf operations
     */
    public static function isGolfOps(): bool {
        return self::hasRole('admin', 'super_admin', 'general_manager', 'golf_manager', 'golf_professional', 'receptionist');
    }

    /**
     * Check if user is a member only (no staff access)
     */
    public static function isMemberOnly(): bool {
        return self::hasRole('member');
    }

    /**
     * Require specific role(s) or send 403
     */
    public static function requireRole(string ...$roles): void {
        self::requireAuth();
        if (!self::hasRole(...$roles)) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Access denied',
                'message' => 'You do not have permission to perform this action'
            ]);
            exit();
        }
    }

    /**
     * Require admin or management role
     */
    public static function requireAdmin(): void {
        self::requireAuth();
        if (!self::isAdmin()) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Access denied',
                'message' => 'Administrator access required'
            ]);
            exit();
        }
    }

    /**
     * Require finance role
     */
    public static function requireFinance(): void {
        self::requireAuth();
        if (!self::isFinance()) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Access denied',
                'message' => 'Finance role required'
            ]);
            exit();
        }
    }

    /**
     * Require member to own resource or be admin
     * Usage: Auth::requireOwnerOrAdmin($resourceMemberId)
     */
    public static function requireOwnerOrAdmin(int $resourceMemberId): void {
        self::requireAuth();
        if (!self::isAdmin() && self::userId() !== $resourceMemberId) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Access denied',
                'message' => 'You can only access your own resources'
            ]);
            exit();
        }
    }

    /**
     * Get client IP address
     */
    public static function getIp(): string {
        return $_SERVER['HTTP_X_FORWARDED_FOR']
            ?? $_SERVER['HTTP_CLIENT_IP']
            ?? $_SERVER['REMOTE_ADDR']
            ?? '0.0.0.0';
    }

    /**
     * Log an audit event
     */
    public static function audit(
        PDO $db,
        string $action,
        string $module,
        ?int $recordId = null,
        string $recordType = null,
        $oldValue = null,
        $newValue = null,
        string $notes = null
    ): void {
        try {
            $stmt = $db->prepare("
                INSERT INTO audit_logs
                (user_id, user_name, action, module, record_id, record_type, old_value, new_value, ip_address, user_agent, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                self::userId(),
                self::userName(),
                $action,
                $module,
                $recordId,
                $recordType,
                $oldValue ? (is_string($oldValue) ? $oldValue : json_encode($oldValue)) : null,
                $newValue ? (is_string($newValue) ? $newValue : json_encode($newValue)) : null,
                self::getIp(),
                $_SERVER['HTTP_USER_AGENT'] ?? null,
                $notes
            ]);
        } catch (Exception $e) {
            // Audit failures should not break the main operation
            error_log("Audit log error: " . $e->getMessage());
        }
    }

    /**
     * Validate pagination parameters
     */
    public static function paginate(array $params): array {
        $page  = max(1, (int)($params['page'] ?? 1));
        $limit = min(100, max(1, (int)($params['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;
        return compact('page', 'limit', 'offset');
    }

    /**
     * Sanitize sort direction
     */
    public static function sortDir(?string $dir): string {
        return strtoupper($dir ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
    }
}
