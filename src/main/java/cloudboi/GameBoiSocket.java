package main.java.cloudboi;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.concurrent.*;

import main.java.gameboi.GameBoi;

//Websocket imports
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

//TODO Logging
//import org.apache.juli.logging.Log;
//import org.apache.juli.logging.LogFactory;

@ServerEndpoint(value = "/stream")
public class GameBoiSocket {

    private Session session;
    //TODO add executor connections to connections set
    private static final Set<GameBoiSocket> connections = new CopyOnWriteArraySet<>();
    private static final ScheduledExecutorService executor =
            Executors.newScheduledThreadPool(5);
    private static final ScheduledThreadPoolExecutor exec_threadPool =
            (ScheduledThreadPoolExecutor)executor;
    private static final int SAVESLOTNUM = 5;
    private GameBoi gboi;
    private ByteBuffer buffer;
    private ScheduledFuture<?> scheduledFuture;
    private String user;

    public GameBoiSocket() {
        gboi = new GameBoi();
        buffer = ByteBuffer.allocate(23040);
        buffer.position(0);
        //TODO better place for this?
        exec_threadPool.setRemoveOnCancelPolicy(true);
        scheduledFuture = null;
        user = "";
    }

    public static int getSaveSlotNum() {
        return SAVESLOTNUM;
    }

    @OnOpen
    public void start(Session session) {
        this.session = session;
        connections.add(this);
    }

    /**
     *
     * sends one frame to the client
     */
    private void sendFrame() {
        buffer.position(0);
        gboi.drawFrameToBuffer(buffer, 1);
        buffer.position(0);
        try {
            session.getBasicRemote().sendBinary(buffer);
        } catch(IOException ex) {
            System.err.println("Error sending frame: " + ex.getLocalizedMessage());
        }
    }


    @OnClose
    public void end() {
        connections.remove(this);
        //stop the thread from running sendFrame
        if (scheduledFuture != null) {
            scheduledFuture.cancel(true);
        }
    }


    /**
     * Handle incoming messages
     * Either a number - keypress event
     * Or a save/load/setuser command
     *
     * @param message
     */
    @OnMessage
    public void incoming(String message) {
        int key_num;
        if (message.length() < 3) {
            //KeyInput Event
            try {
                key_num = Integer.parseInt(message);
            } catch (NumberFormatException e) {
                key_num = -1;
            }
            if (key_num >= 0 && key_num <= 7) {
                gboi.keyPressed(key_num);
            } else if (key_num >= 8 && key_num <= 15) {
                gboi.keyReleased(key_num - 8);
            } else if (key_num == 16) {
                pauseGame();
            } else if (key_num == 17) {
                resumeGame();
            }
        } else {
            //Command event
            String[] command = message.split(":");
            System.err.println(command[0] + " " + command[1]);
            switch(command[0]) {
                case "save":
                    saveGame(Integer.parseInt(command[1]));
                    return;
                case "loadRom":
                    loadRom(command[1]);
                    return;
                case "loadSave":
                    loadSave(Integer.parseInt(command[1]));
                    return;
                case "set":
                    setUser(command[1]);
                    return;
                default:
                    System.err.println("invalid command: " + message);
            }
        }
    }


    private void saveGame(int slot) {
        pauseGame();
        if (slot < SAVESLOTNUM && slot >= 0) {
            gboi.saveGame(user + Integer.toString(slot));
            resumeGame();
        } else {
            System.err.println("failed to save");
        }
    }

    private void loadSave(int slot) {
        pauseGame();
        if (slot <= SAVESLOTNUM && slot >= 0 && gboi.getSaves().contains(user + Integer.toString(slot) + ".gbs")) {
            gboi = new GameBoi();
            gboi.loadSave(user + Integer.toString(slot) + ".gbs");
            resumeGame();
        }
    }

    /**
     * Load a Rom
     * TODO: Redo current state of game (should swap)
     *
     * @param romName to Load
     */
    private void loadRom(String romName) {
        pauseGame();
        if (gboi.getRoms().contains(romName + ".gb")) {
            gboi = new GameBoi();
            gboi.loadRom(romName);
            System.err.println("loaded");
            resumeGame();
        }
    }

    /**
     *
     *
     * @param user to attempt to set to
     */
    private void setUser(String user) {
        Path users = Paths.get(gboi.getHome().toString() + "/users.txt");
        boolean isValidUser = false;
        try {
            if (users.toFile().isFile()) {
                List<String> userNames = Files.readAllLines(users, StandardCharsets.UTF_8);
                if (userNames.contains(user)) {
                    isValidUser = true;
                }
            }
        } catch(IOException e) {
            System.err.println("could not add user: " + user + " " + e.getLocalizedMessage());
        }

        if (isValidUser) {
            this.user = user;
            System.out.println("set user to: " + user);
        }
    }


    private void resumeGame() {
        //check for actually being paused
        if (scheduledFuture == null || scheduledFuture.isCancelled()) {
            scheduledFuture = exec_threadPool.scheduleAtFixedRate(() ->
                    sendFrame(), 0,17,TimeUnit.MILLISECONDS);
        }
    }
    private void pauseGame() {
        //stop the streaming of the frames
        if (scheduledFuture != null) {
            scheduledFuture.cancel(false);
        }
    }


    @OnError
    public void onError(Throwable t) throws Throwable {
        System.err.println(t.toString());
    }
}