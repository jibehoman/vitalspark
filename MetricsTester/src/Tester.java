
import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageConsumer;
import javax.jms.QueueConnection;
import javax.jms.QueueSender;
import javax.jms.QueueSession;
import javax.jms.Session;
import javax.jms.TextMessage;

import progress.message.jclient.QueueConnectionFactory;

public class Tester {
	String m_url;

	Tester(String url) {
		m_url = url;
	}

	public void run() throws JMSException {
		QueueConnectionFactory cf = new QueueConnectionFactory();
		cf.setBrokerURL(m_url);
		QueueConnection qc = cf.createQueueConnection("Administrator",
				"Administrator");
		Session ss = qc
				.createQueueSession(false, QueueSession.AUTO_ACKNOWLEDGE);
		Session rs = qc
				.createQueueSession(false, QueueSession.AUTO_ACKNOWLEDGE);
		String[] colors = new String[] { "Red", "Blue", "Green", "Cyan" };
		for (int c = 0; c < colors.length; c++) {
			try {
				Thread.sleep(10000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			Destination d = ss.createQueue(colors[c]);
			QueueSender qs = (QueueSender) ss.createProducer(d);
			MessageConsumer qr = rs.createConsumer(d);
			TextMessage tm = ss.createTextMessage("1234567890");
			new Thread(new Activity(qr, qs, tm)).start();
		}
		qc.start();
	}

	final class Activity implements Runnable {
		private static final int COUNT = 100;
		private static final long DELAY = 1000;
		MessageConsumer qr;
		QueueSender qs;
		TextMessage tm;

		Activity(MessageConsumer qr, QueueSender qs, TextMessage tm) {
			this.qr = qr;
			this.qs = qs;
			this.tm = tm;
		}

		@Override
		public void run() {
			while (true) {
				for (int i = 0; i < COUNT; i++) {
					try {
						qs.send(tm);
					} catch (JMSException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
					try {
						Thread.sleep(DELAY);
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
				for (int i = 0; i < COUNT; i++) {
					try {
						Message m = qr.receive();
					} catch (JMSException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
					try {
						Thread.sleep(DELAY);
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
				System.out.print(".");
				Message m = null;
				try {
					m = qr.receive(100);
				} catch (JMSException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
				while (m != null) {
					try {
						m = qr.receive(100);
					} catch (JMSException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}

			}
		}

	}

	public static void main(String[] args) throws Exception {
		if (args.length < 1) {
			System.out.println("Usage: Missing URL argument");
			System.exit(-1);
		}
		byte b[] = new byte[1024];
		new Tester(args[0]).run();
		System.in.read(b, 0, 1024);
		System.out.println("Done");
		System.exit(0);
	}
}
