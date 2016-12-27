package pbm.debugutil.deobf;

import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.Vector;


public class Deobfuscate {

	public static void main(String[] argv) {

		Vector<String> jobeLogs = new Vector<String>();
		boolean console = false;

		for (int i = 0; i < argv.length; i++) {
			String arg = argv[i];

			// Options
			if (!arg.startsWith("-")) {

				System.err.println("Error: unexpected argument: " + arg);
				printUsage();
				System.exit(1);

			} else {

				if (arg.equals("-console")) {
					
					console = true;
					
				} else if (arg.equals("-jobe")) {
					
					if (i == argv.length - 1 || argv[i + 1].startsWith("-")) {
						System.err.println("Error: missing jobe log path");
						System.exit(1);
					}
					jobeLogs.add(argv[++i]);
					
				} else {
				
					System.err.println("Error: unexpected argument: " + arg);
					printUsage();
					System.exit(1);
					
				}
				
			}
		}

		if (console && jobeLogs.size() == 0) {
			System.err.println("Error: at least one jobe log must be provided when using console mode");
			System.exit(1);
		}

		DeobfuscateManager deobfuscator = new DeobfuscateManager();

		if (console) {

			// Load jobe log(s)
			for (String filename : jobeLogs) {

				File jobelog = new File(filename);

				if (!jobelog.canRead()) {
					System.err.println("File " + filename
							+ " not found, or not readable");
					System.exit(1);
				}

				try {
					deobfuscator.loadJOBELog(jobelog);
				} catch (Exception e) {
					System.err.println("Error while processing " + filename + "...");

					e.printStackTrace();
					System.exit(1);
				}

			}
			
			try {

				BufferedReader inputReader;

				inputReader = new BufferedReader(new InputStreamReader(
						System.in));

				String currline = inputReader.readLine();

				while (currline != null) {
					System.out.println(deobfuscator.deobfuscateLine(currline));
					currline = inputReader.readLine();
				}

			} catch (java.io.EOFException eof) {
				// Do nothing
			} catch (Exception e) {
				e.printStackTrace();
			}

		} else {

			//System.err.println("Sorry, GUI mode not yet implemented.  Please use console mode.");
			DeobfuscateFrame deobfuscateGUI = new DeobfuscateFrame(deobfuscator);
			deobfuscateGUI.showGUI();
			
			deobfuscateGUI.addWindowListener(new WindowAdapter() {
	            public void windowClosing(WindowEvent e) {System.exit(0);}});

			// Load pre-referenced jobe log(s)
			for (String filename : jobeLogs) {
				File jobelog = new File(filename);
				deobfuscateGUI.loadJOBELog(jobelog);
			}
			
			deobfuscateGUI.setVisible(true);

			
		}

	}

	private static void printUsage() {
		System.err
				.println("Usage: java Deobfuscate [-console] {-jobe <jobe-log>}");
		System.err
				.println("  -- if run in console mode, at least one jobe log must be provided");
	}

}
