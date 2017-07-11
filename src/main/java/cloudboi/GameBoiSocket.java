package main.java.cloudboi;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.concurrent.*;

import main.java.gameboi.GameBoi;

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
    private GameBoi gboi;
    private ByteBuffer buffer;
    private ScheduledFuture<?> scheduledFuture;

    public GameBoiSocket() {
        gboi = new GameBoi();
        buffer = ByteBuffer.allocate(23040);
        buffer.position(0);
        //TODO better place for this?
        exec_threadPool.setRemoveOnCancelPolicy(true);
    }


    @OnOpen
    public void start(Session session) {
        Path tetris = Paths.get("/Users/thomas/stuff/tetris.gb");
        gboi.loadRom(tetris);
        this.session = session;
        connections.add(this);
        scheduledFuture = executor.scheduleAtFixedRate(() ->
                          sendFrame(), 0, 17, TimeUnit.MILLISECONDS);
    }

    /**
     *
     * sends one frame to the client
     */
    private void sendFrame() {
        buffer.position(0);
        gboi.drawFrameToBuffer(buffer);
        buffer.position(0);
        try {
            session.getBasicRemote().sendBinary(buffer);
        } catch(IOException ex) {
            System.err.println("Error sending frame");
        }
    }


    @OnClose
    public void end() {
        connections.remove(this);
        //stop the thread from running sendFrame
        scheduledFuture.cancel(true);
    }


    @OnMessage
    public void incoming(String message) {
        int key_num;
        try {
            key_num = Integer.parseInt(message);
        } catch (NumberFormatException e) {
            key_num = -1;
        }

        if (key_num >= 0 && key_num <= 7) {
            //TODO doesnt seem to be registering after a second???
            gboi.keyPressed(key_num);
        } else if (key_num >= 8 && key_num <= 15) {
            gboi.keyReleased(key_num - 8);
        } else if (key_num == 16) {
            pauseGame();
        } else if (key_num == 17) {
            resumeGame();
        }
    }


    private void resumeGame() {

    }
    private void pauseGame() {

    }


    @OnError
    public void onError(Throwable t) throws Throwable {
        System.err.println(t.toString());
    }
}