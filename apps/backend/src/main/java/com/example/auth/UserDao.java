// UserDao.java
import java.sql.*;
import org.mindrot.jbcrypt.BCrypt;

public class UserDao {
    public static boolean emailExists(String email) throws SQLException {
        String sql = "SELECT 1 FROM users WHERE email = ?";
        try (Connection c = DatabaseConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            return rs.next();
        }
    }

    public static int create(String email, String rawPassword, String name) throws SQLException {
        String hash = BCrypt.hashpw(rawPassword, BCrypt.gensalt(12));
        String sql = "INSERT INTO users(email, password_hash, name) VALUES(?,?,?)";
        try (Connection c = DatabaseConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, email);
            ps.setString(2, hash);
            ps.setString(3, name);
            ps.executeUpdate();
            ResultSet keys = ps.getGeneratedKeys();
            return keys.next() ? keys.getInt(1) : -1;
        }
    }

    public static Integer verify(String email, String rawPassword) throws SQLException {
        String sql = "SELECT id, password_hash FROM users WHERE email = ?";
        try (Connection c = DatabaseConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) return null;
            String hash = rs.getString("password_hash");
            if (BCrypt.checkpw(rawPassword, hash)) {
                return rs.getInt("id");
            }
            return null;
        }
    }

    public static UserDto findById(int id) throws SQLException {
        String sql = "SELECT id, email, name, created_at FROM users WHERE id = ?";
        try (Connection c = DatabaseConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) return null;
            return new UserDto(rs.getInt("id"), rs.getString("email"), rs.getString("name"));
        }
    }

    public record UserDto(int id, String email, String name) {}
}
