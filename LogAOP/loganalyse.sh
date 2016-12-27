if [ -z "$1" ]; then
 echo "Usage: loganalyse.sh pathtorecoverylogs"
 echo "e.g loganalyse.sh /c/support/MQ-35012/Y1OCT7"
 echo ""
 exit -1
fi;
export SONICBASE="/c/Aurea/Sonic2015"
export SONICVER=10.0
export SEP=:
export AOP="-javaagent:C:\Aurea\Sonic2015\Archives\MF\10.0\actional-plugmaker.jar -Dcom.actional.aops=aop/LogDiagnosticsInterceptor.aal"
java   $AOP -classpath "./loganalyse.jar$SEP$SONICBASE/MQ$SONICVER/lib/broker.jar$SEP$SONICBASE/MQ$SONICVER/lib/sonic_mgmt_client.jar$SEP$SONICBASE/MQ$SONICVER/lib/MFagent.jar$SEP$SONICBASE/MQ$SONICVER/lib/MFcommon.jar$SEP$SONICBASE/MQ$SONICVER/lib/mfcontext.jar$SEP$SONICBASE/MQ$SONICVER/lib/MFcore.jar$SEP$SONICBASE/MQ$SONICVER/lib/MFdaemon.jar$SEP$SONICBASE/MQ$SONICVER/lib/MFdirectory.jar$SEP$SONICBASE/MQ$SONICVER/lib/MFhostmanager.jar$SEP$SONICBASE/MQ$SONICVER/lib/MFlaunch.jar$SEP$SONICBASE/MQ$SONICVER/lib/MFlogger.jar$SEP$SONICBASE/MQ$SONICVER/lib/MFmanager.jar$SEP$SONICBASE/MQ$SONICVER/lib/MFmonitor.jar$SEP$SONICBASE/MQ$SONICVER/lib/MFtriggers.jar$SEP$SONICBASE/MQ$SONICVER/lib/mgmt_client.jar$SEP$SONICBASE/MQ$SONICVER/lib/mgmt_config.jar$SEP" progress.message.broker.LogFile $1
