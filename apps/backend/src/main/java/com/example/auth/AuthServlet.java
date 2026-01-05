// AuthServlet.java
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import jakarta.servlet.*;
import java.io.*;
import java.sql.SQLException;
import java.util.*;

@WebServlet(name="AuthServlet", urlPatterns={"/api/auth/*"})
public class AuthServlet extends HttpServlet {
    private final Gson gson = new Gson();

    static class RegisterReq { String email; String password; String name; }
    static class LoginReq    { String email; String password; }
    static class ApiResp<T>  { boolean ok; String error; T data; ApiResp(boolean ok, String error, T data){this.ok=ok;this.error=error;this.data=data;} }

    @Override protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        resp.setHeader("Access-Control-Allow-Origin",  Optional.ofNullable(req.getHeader("Origin")).orElse("*"));
        resp.setHeader("Access-Control-Allow-Credentials", "true");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        resp.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");

        String path = Optional.ofNullable(req.getPathInfo()).orElse("/");
        try (BufferedReader reader = req.getReader()) {
            if ("/register".equals(path)) {
                RegisterReq body = gson.fromJson(reader, RegisterReq.class);
                if (body==null || isBlank(body.email) || isBlank(body.password)) {
                    resp.setStatus(400);
                    gson.toJson(new ApiResp<>(false,"missing_fields",null), resp.getWriter());
                    return;
                }
                if (UserDao.emailExists(body.email)) {
                    resp.setStatus(409);
                    gson.toJson(new ApiResp<>(false,"email_exists",null), resp.getWriter());
                    return;
                }
                int id = UserDao.create(body.email, body.password, body.name);
                gson.toJson(new ApiResp<>(true,null, Map.of("id", id, "email", body.email, "name", body.name)), resp.getWriter());
                return;

            } else if ("/login".equals(path)) {
                LoginReq body = gson.fromJson(reader, LoginReq.class);
                if (body==null || isBlank(body.email) || isBlank(body.password)) {
                    resp.setStatus(400);
                    gson.toJson(new ApiResp<>(false,"missing_fields",null), resp.getWriter());
                    return;
                }
                Integer userId = UserDao.verify(body.email, body.password);
                if (userId==null) {
                    resp.setStatus(401);
                    gson.toJson(new ApiResp<>(false,"invalid_credentials",null), resp.getWriter());
                    return;
                }
                // Session HTTP
                HttpSession session = req.getSession(true);
                session.setAttribute("uid", userId);
                session.setMaxInactiveInterval(60*60*8); // 8h
                gson.toJson(new ApiResp<>(true,null, Map.of("userId", userId)), resp.getWriter());
                return;

            } else {
                resp.setStatus(404);
                gson.toJson(new ApiResp<>(false,"not_found",null), resp.getWriter());
            }
        } catch (SQLException e) {
            resp.setStatus(500);
            gson.toJson(new ApiResp<>(false,"sql_error:"+e.getMessage(),null), resp.getWriter());
        }
    }

    @Override protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin",  Optional.ofNullable(req.getHeader("Origin")).orElse("*"));
        resp.setHeader("Access-Control-Allow-Credentials", "true");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        resp.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
    }

    private static boolean isBlank(String s){ return s==null || s.trim().isEmpty(); }

    @Override protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // /api/auth/me -> renvoie l'utilisateur courant (optionnel mais pratique)
        if (!"/me".equals(Optional.ofNullable(req.getPathInfo()).orElse(""))) { resp.setStatus(404); return; }
        resp.setContentType("application/json;charset=UTF-8");
        resp.setHeader("Access-Control-Allow-Origin",  Optional.ofNullable(req.getHeader("Origin")).orElse("*"));
        resp.setHeader("Access-Control-Allow-Credentials", "true");

        HttpSession session = req.getSession(false);
        Integer uid = (session!=null) ? (Integer) session.getAttribute("uid") : null;
        if (uid==null){ resp.setStatus(401); resp.getWriter().write("{\"ok\":false,\"error\":\"not_authenticated\"}"); return; }
        try {
            var u = UserDao.findById(uid);
            resp.getWriter().write(gson.toJson(new ApiResp<>(true,null, Map.of("id", u.id(), "email", u.email(), "name", u.name()))));
        } catch (SQLException e) {
            resp.setStatus(500);
            resp.getWriter().write("{\"ok\":false,\"error\":\"sql_error\"}");
        }
    }
}
