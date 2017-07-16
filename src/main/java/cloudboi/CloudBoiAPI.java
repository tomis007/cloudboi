package main.java.cloudboi;

import com.google.gson.Gson;
import main.java.gameboi.GameBoi;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.File;
import java.nio.file.Paths;
import java.util.List;
import main.java.cloudboi.GameBoiSocket;

/**
 */
@WebServlet("/API")
public class CloudBoiAPI extends HttpServlet {
    private static final GameBoi gb = new GameBoi();
    private static final Path home = gb.getHome();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String info = request.getParameter("info");
        String json;

        if (info == null) {
            response.sendError(404);
            return;
        }
        response.setContentType("application/json;charset=UTF-8");
        if (info.equals("roms")) {
            List<String> roms = gb.getRoms();
            for (String rom : roms) {
                if (rom.endsWith(".gb")) {
                    roms.set(roms.indexOf(rom), rom.replace(".gb",""));
                }
            }
            json = new Gson().toJson(roms);
        } else if (info.equals("saves")) {
            //TODO Only for each user!
            List<String> saves = gb.getSaves();
            for (String name : saves) {
                if (name.endsWith(".gbs")) {
                    saves.set(saves.indexOf(name), name.replace(".gbs", ""));
                }
            }
            json = new Gson().toJson(saves);
        } else if (info.equals("users")) {
            Path users = Paths.get(home.toString() + "/users.txt");
            if (users.toFile().isFile()) {
                List<String> userNames = Files.readAllLines(users, StandardCharsets.UTF_8);
                json = new Gson().toJson(userNames);
            } else {
                json = "[\"Error\"]";
            }
        } else if (info.equals("slots")) {
            json = "[\"" + Integer.toString(GameBoiSocket.getSaveSlotNum()) + "\"]";
        } else {
            json = "[\"Error\"]";
        }

        //send response
        response.setStatus(200);
        try (PrintWriter out = response.getWriter()) {
            out.print("{\"info\":");
            out.print(json);
            out.print("}");
        }
    }
}
