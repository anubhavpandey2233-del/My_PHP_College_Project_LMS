
<?php

/**
 * Token Helper for Authentication
 */

function generateToken($length = 64)
{
    return bin2hex(random_bytes($length / 2));
}


function createUserToken($pdo, $userId)
{
    // Delete old tokens for this user
    $stmt = $pdo->prepare(
        "DELETE FROM user_tokens WHERE user_id = ?"
    );

    $stmt->execute([$userId]);


    // Generate new token
    $token = generateToken();


    // Token valid for 7 days
    $expiresAt = date(
        'Y-m-d H:i:s',
        strtotime('+7 days')
    );


    // Save token
    $stmt = $pdo->prepare(
        "INSERT INTO user_tokens
        (user_id, token, expires_at)
        VALUES (?, ?, ?)"
    );

    $stmt->execute([
        $userId,
        $token,
        $expiresAt
    ]);


    return $token;
}


function validateToken($pdo, $token)
{
    $stmt = $pdo->prepare(
        "
        SELECT
            ut.user_id,

            ut.expires_at,

            u.id,
            u.name,
            u.email,
            u.phone,
            u.avatar,
            u.bio,
            u.status,
            u.created_at,

            u.role_id,

            r.name AS role

        FROM user_tokens ut

        JOIN users u
            ON ut.user_id = u.id

        JOIN roles r
            ON u.role_id = r.id

        WHERE
            ut.token = ?
            AND ut.expires_at > NOW()
            AND u.status = 'active'
        "
    );


    $stmt->execute([$token]);


    return $stmt->fetch(PDO::FETCH_ASSOC);
}

