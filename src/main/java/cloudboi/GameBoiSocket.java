package main.java.cloudboi;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicInteger;

import main.java.gameboi.GameBoi;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

//import org.apache.juli.logging.Log;
//import org.apache.juli.logging.LogFactory;

@ServerEndpoint(value = "/stream")
public class GameBoiSocket {

    //private static final Log log = LogFactory.getLog(ChatAnnotation.class);
    private Session session;
    private static final Set<GameBoiSocket> connections = new CopyOnWriteArraySet<>();
    private int test;
    private GameBoi gboi;
    private ByteBuffer buffer;


    public GameBoiSocket() {
        gboi = new GameBoi();
        buffer = ByteBuffer.allocate(23040);
        buffer.position(0);
        test = 0;
    }


    @OnOpen
    public void start(Session session) {
        Path tetris = Paths.get("/Users/thomas/stuff/tetris.gb");
        gboi.loadRom(tetris);
        this.session = session;
        connections.add(this);
        try {
            session.getBasicRemote().sendBinary(buffer);
            while (true) {
                buffer.position(0);
                session.getBasicRemote().sendBinary(buffer);
                try {
                    Thread.sleep(16);
                } catch(InterruptedException ex) {
                    Thread.currentThread().interrupt();
                }
                gboi.drawFrameToBuffer(buffer);
            }
        } catch (IOException e) {
            test += 1;
        }
        test += 1;
    }


    @OnClose
    public void end() {
        connections.remove(this);
    }


    @OnMessage
    public void incoming(String message) {
        // Never trust the client
        try {
            session.getBasicRemote().sendText(message);
        } catch (IOException e) {
            test += 1;
        }
    }




    @OnError
    public void onError(Throwable t) throws Throwable {
        //log.error("Chat Error: " + t.toString(), t);
    }
}