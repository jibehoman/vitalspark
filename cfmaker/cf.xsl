<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:saxon="http://saxon.sf.net/"
                xmlns:wh="whatsup"
                xmlns:wh2="whatsup2"
                xmlns:wh3="whatsup3"
>
<!-- stylesheet to generate cloudformation variants
-->
<xsl:output method="text" omit-xml-declaration="yes"  indent="no" />
<xsl:namespace-alias result-prefix="xsl" stylesheet-prefix="wh"/>
<xsl:namespace-alias result-prefix="" stylesheet-prefix="wh2"/>
<xsl:namespace-alias result-prefix="saxon" stylesheet-prefix="wh3"/>

<xsl:variable name="numbers" select="'1,2,3,4,5,6,7,8'"/>
<xsl:variable name="docroot" select="/"/>
<xsl:variable name="owner" select="/Template/General/Owner"/>
<xsl:variable name="dbowner" select="/Template/General/DbOwner"/>
<xsl:variable name="AMI" select="/Template/General/AMI"/>
<xsl:variable name="linuxbrand" select="/Template/General/Linux"/>
<xsl:variable name="instancetype" select="/Template/General/InstanceType"/>
<xsl:variable name="arch" select="/Template/General/Architecture"/>
<xsl:variable name="archjvm" select="/Template/General/ArchitectureJVM"/>
<xsl:variable name="key" select="/Template/General/Key"/>
<xsl:variable name="awsaccesskey" select="/Template/General/AWSAccessKey"/>
<xsl:variable name="awssecretkey" select="/Template/General/AWSSecretKey"/>
<xsl:variable name="availabilityzones" select="/Template/General/AvailabilityZones"/>

<xsl:variable name="numsonicinstances" select="/Template/Sonic/NumMachines"/>
<xsl:variable name="sonicmajorminor" select="/Template/Sonic/Version/SonicInstall/Major.Minor"/>
<xsl:variable name="sonicsubdirmajorminor" select="/Template/Sonic/Version/SonicInstall/Subdirectory.Major.Minor"/>
<xsl:variable name="sonicbuild" select="/Template/Sonic/Version/SonicInstall/Build"/>
<xsl:variable name="launchermajorminor" select="/Template/Sonic/Version/LauncherInstall/Major.Minor"/>
<xsl:variable name="launcherbuild" select="/Template/Sonic/Version/LauncherInstall/Build"/>
<xsl:variable name="model" select="/Template/Sonic/Model"/>
<xsl:variable name="vpcstyle" select="/Template/Sonic/Vpc/Style"/>
<xsl:variable name="cidr" select="/Template/Sonic/Vpc/Cidr"/>
<xsl:variable name="cidrprefix" select="substring-before($cidr,'.0.0')"/>
<xsl:variable name="numavailabilityzones" select="/Template/Sonic/Vpc/NumAvailabilityZones"/>

<xsl:include href="includes/tags.xsl" />
<xsl:include href="includes/network.xsl" />
<xsl:include href="includes/actional.xsl" />
<xsl:include href="includes/rds.xsl" />

<!-- 

Sonic Instance Emiter

-->


<xsl:template name="emitSonic">
    <xsl:param name="instance" />
    <xsl:param name="publicsubnet" />
    <xsl:param name="privatesubnet" />
<xsl:text>
    "SonicInstance</xsl:text><xsl:value-of select="$instance"/><xsl:text>": {
      "Type": "AWS::EC2::Instance",
</xsl:text><xsl:if test="$instance ne '1'"><xsl:text>
      "DependsOn": ["SonicInstance1"],
</xsl:text></xsl:if><xsl:text>
      "Metadata" : {

        "AWS::CloudFormation::Init" : {
          "configSets" : {
            "initial" : [ "config1" ],
            "secondary" : [ "config2" ]
          },
          "config1" : {
            "packages" : {
             "rpm" : {
              "vnc-server-4.1.2-14.el5_6.6.</xsl:text><xsl:value-of select="$arch"/><xsl:text>" : "ftp://mirror.switch.ch/pool/1/mirror/scientificlinux/58/</xsl:text><xsl:value-of select="$arch"/><xsl:text>/SL/vnc-server-4.1.2-14.el5_6.6.</xsl:text><xsl:value-of select="$arch"/><xsl:text>.rpm"
              },
              "yum" : {
                "tcpdump"        : [],
                "strace"        : [],
                "java-1.7.0-openjdk"        : [],
                "xterm"        : []
              }
             },

            "sources" : {
</xsl:text>
<xsl:choose>
<xsl:when test="$sonicmajorminor ne '2013'">
<xsl:text>
              "/aurea/software/sonic" : "https://s3.amazonaws.com/Aurea_Software_Transfers/Sonic/copy_build/SONICINSTALLS</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>/SONICINSTALLS</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>-</xsl:text><xsl:value-of select="$sonicbuild"/><xsl:text>.tar.gz",
              "/aurea/software/launcher" : "https://s3.amazonaws.com/Aurea_Software_Transfers/Sonic/copy_build/LAUNCHER</xsl:text><xsl:value-of select="$launchermajorminor"/><xsl:text>/LAUNCHER</xsl:text><xsl:value-of select="$launchermajorminor"/><xsl:text>-</xsl:text><xsl:value-of select="$launcherbuild"/><xsl:text>.tar.gz",
</xsl:text>
</xsl:when>
<xsl:otherwise>
<!-- comment out we'll apply the patch directly 
              "/aurea/software/sonic" : "https://s3.amazonaws.com/sonic-aurea/releases/ESD/ESD_</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>/INSTALLER/AUREA_SONIC_</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>_UNIX.tar.gz",
-->
<xsl:text>
              "/aurea/software/sonic/AUREA_SONIC_</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>_UNIX" : "https://s3.amazonaws.com/aurea-test-peaston/Sonic2013/install.zip",
              "/aurea/software/launcher" : "https://s3.amazonaws.com/sonic-aurea/releases/ESD/ESD_</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>/LAUNCHER/AUREA_SONIC_LAUNCHER_</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>_UNIX.tar.gz",
</xsl:text>
</xsl:otherwise>
</xsl:choose>
<xsl:text>
              "/aurea/software/models" : "https://s3.amazonaws.com/aurea-test-peaston/sdmmodels/MusePhase1-RHEVSonicTests.zip",
              "/aurea/software" : "https://s3.amazonaws.com/aurea-test-peaston/Sonic2013/projects.tar"
            },
            "files" : {
               "/home/ec2-user/prep/installDMManager.sh" : {
                "content" : { "Fn::Join" : ["", [
</xsl:text>
<xsl:choose>
<xsl:when test="$sonicmajorminor ne '2013'">
<xsl:text>
"chmod a+x /aurea/software/sonic/SONICINSTALLS</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>-</xsl:text><xsl:value-of select="$sonicbuild"/><xsl:text>/cdimage/install.bin", "\n",
"/aurea/software/sonic/SONICINSTALLS</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>-</xsl:text><xsl:value-of select="$sonicbuild"/><xsl:text>/cdimage/install.bin -i silent ",
" -f \"/home/ec2-user/prep/DMManager.base.properties\"", "\n",
</xsl:text>
</xsl:when>
<xsl:otherwise>
<xsl:text>
"chmod a+x /aurea/software/sonic/AUREA_SONIC_</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>_UNIX/install.bin", "\n",
"/aurea/software/sonic/AUREA_SONIC_</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>_UNIX/install.bin -i silent", 
" -f \"/home/ec2-user/prep/DMManager.base.properties\"", "\n",
</xsl:text>
</xsl:otherwise>
</xsl:choose>
<xsl:text>
"/opt/aurea/sonic</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>/Containers/Domain1.DomainManager/launchcontainer_batch.sh Domain1.DomainManager.log", "\n",
"exit", "\n"

                ]]},
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
               },
               "/home/ec2-user/prep/DMManager.base.properties" : {
                "content" : { "Fn::Join" : ["", [
"INSTALL_TYPE=new", "\n",
"INSTALLER_UI=silent", "\n",
"INSTALL_LOCATION=/opt/aurea/sonic</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>", "\n",
"\n",
"USER_CHOSEN_INSTALL_SET=development", "\n",
"\n",
"ACCEPT_LICENSE_AGREEMENT=true", "\n",
"DEV_KEY=jmv88kqjmbc8e43", "\n",
"SDM_KEY=mrwgkqjmbc8e43", "\n",
"\n",
"CONFIGURE_DOMAIN=true", "\n",
"#MGMT_CONNECTION_URLS=tcp://dmmanager:2506", "\n",
"CONNECTION_URLS=tcp://dmmanager:2506", "\n",
"MGMT_BROKER_PORT=2506", "\n",
"ENABLE_SECURITY=true", "\n",
"SECURITY_USER_NAME=Administrator", "\n",
"SECURITY_PASSWORD=Administrator", "\n",
"CHOSEN_JVM_HOME=</xsl:text><xsl:value-of select="$archjvm"/><xsl:text>", "\n",
"CHOSEN_ECLIPSE_HOME=/opt/aurea/sonic</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>/Workbench</xsl:text><xsl:value-of select="$sonicsubdirmajorminor"/><xsl:text>/eclipse", "\n"

                ]]},
                "mode"    : "000644",
                "owner"   : "root",
                "group"   : "root"
              },
               "/home/ec2-user/prep/installHostManager.sh" : {
                "content" : { "Fn::Join" : ["", [
"#!/bin/sh -xv", "\n",
"SATELLITE=satellite</xsl:text><xsl:value-of select="number($instance) - number(1)"/><xsl:text>", "\n",
"DOMAIN=ProductionDomain", "\n",
"URL=dmmanager:4500", "\n",
"USER=Administrator", "\n",
"PASSWORD=Administrator", "\n",
"\n",
"if [ -d /opt/aurea/soniclauncher</xsl:text><xsl:value-of select="$launchermajorminor"/><xsl:text> ] ; then", "\n",
"echo \"Deleting existing host manager\"", "\n",
"ps -ef | grep soniclauncher</xsl:text><xsl:value-of select="$launchermajorminor"/><xsl:text> | cut -c10-14 | tr '\r' \" \"  | tr '\n' \" \" | awk '{ print \"kill -9 \" $0 }' | bash", "\n",
"rm -rf /opt/aurea/soniclauncher</xsl:text><xsl:value-of select="$launchermajorminor"/><xsl:text>", "\n",
"fi", "\n",
"\n",
"\n",
"HOSTNAME=`hostname`", "\n",
"CNAME=ctHm_\"$SATELLITE\"", "\n",
"CPATH=\"$DOMAIN\".\"$CNAME\"", "\n",
"echo \"Setting up Sonic container with host manager for hostname '$HOSTNAME'\"", "\n",
"sed \"/DOMAIN_NAME/d\" /home/ec2-user/prep/HostManager.base.properties > .t", "\n",
"echo \"DOMAIN_NAME=\"$DOMAIN >> .t", "\n",
"cp .t /home/ec2-user/prep/HostManager.base.properties", "\n",
"\n",
</xsl:text>
<xsl:choose>
<xsl:when test="$sonicmajorminor ne '2013'">
<xsl:text>
"/aurea/software/launcher/LAUNCHER</xsl:text><xsl:value-of select="$launchermajorminor"/><xsl:text>-</xsl:text><xsl:value-of select="$launcherbuild"/><xsl:text>/cdimage/install_container_launcher.bin -i silent ",
</xsl:text>
</xsl:when>
<xsl:otherwise>
<xsl:text>
"/aurea/software/launcher/AUREA_SONIC_LAUNCHER_</xsl:text><xsl:value-of select="$launchermajorminor"/><xsl:text>_UNIX/install_container_launcher.bin -i silent ",
</xsl:text>
</xsl:otherwise>
</xsl:choose>
<xsl:text>
"-D\\$DOMAIN_NAME\\$=$DOMAIN -D\\$CONNECTION_URLS\\$=$URL  -D\\$SECURITY_USER\\$=$USER ",
"-D\\$SECURITY_PASSWORD\\$=$PASSWORD -D\\$CONTAINER_NAME\\$=$CNAME ",
"-D\\$CONTAINER_PATH\\$=\"/Containers/$CNAME\" ",
"-f \"/home/ec2-user/prep/HostManager.base.properties\"", "\n",
"/opt/aurea/soniclauncher</xsl:text><xsl:value-of select="$launchermajorminor"/><xsl:text>/Containers/\"$CPATH\"/launchcontainer_batch.sh $CPATH.log", "\n",
"exit", "\n"

                ]]},
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
              },
               "/home/ec2-user/prep/HostManager.base.properties" : {
                "content" : { "Fn::Join" : ["", [
"INSTALL_TYPE=new", "\n",
"INSTALL_LOCATION=/opt/aurea/soniclauncher</xsl:text><xsl:value-of select="$launchermajorminor"/><xsl:text>", "\n",
"#Configure Container", "\n",
"#-------------------", "\n",
"CONFIGURE_CONTAINER=true", "\n",
"#Domain Manager Connection Properties", "\n",
"#------------------------------------", "\n",
"CONNECTION_URLS=tcp://localhost:2506", "\n",
"SECURITY_USER=Administrator", "\n",
"SECURITY_PASSWORD=Administrator", "\n",
"#The name of the container to configure", "\n",
"#--------------------------------------", "\n",
"CONTAINER_NAME=scripted", "\n",
"#The path for the configured container", "\n",
"#-------------------------------------", "\n",
"CONTAINER_PATH=/scripted/scripted", "\n",
"#Determine if the container configuration should be created if it does not", "\n",
"#exist", "\n",
"#------------------------------------------------------------------------", "\n",
"#-----", "\n",
"CREATE_CONTAINER_CONFIG=true", "\n",
"#The path for the host manager", "\n",
"#-----------------------------", "\n",
"HOST_MANAGER_PATH=/Framework Components/HOST MANAGER", "\n",
"#Should the host manager be configured?", "\n",
"#-------------------------------", "\n",
"HOST_MANAGER_ENABLED=true", "\n",
"#Chosen JVM Home directory", "\n",
"#-------------------------", "\n",
"CHOSEN_JVM_HOME=</xsl:text><xsl:value-of select="$archjvm"/><xsl:text>", "\n",
"#Launch Container Process", "\n",
"#------------------------", "\n",
"LAUNCH_CONTAINER=true", "\n",
"#------------------------", "\n",
"ACCEPT_LICENSE_AGREEMENT=true", "\n",
"\n",
"DOMAIN_NAME=Domain1", "\n"

                ]]},
                "mode"    : "000644",
                "owner"   : "root",
                "group"   : "root"
              },
               "/home/ec2-user/prep/deployModel.sh" : {
                "content" : { "Fn::Join" : ["", [
"if [ -z $1 ] ; then", "\n",
"        echo  \"Usage: deployModel directory [environment]\"", "\n",
"        return 0", "\n",
"fi;", "\n",
"MODEL=$1", "\n",
"MNV=$2", "\n",
"if [ -z $2 ] ; then", "\n",
"        MNV=production", "\n",
"fi;", "\n",
"sudo /usr/bin/cfn-init --stack ", { "Ref" : "AWS::StackId" }, " --configsets secondary --resource SonicInstance</xsl:text><xsl:value-of select="$instance"/><xsl:text> --region ", { "Ref" : "AWS::Region" }, "\n",
"/home/ec2-user/prep/fixHosts.sh", "\n",
"/home/ec2-user/prep/renewTopology.sh \"$MODEL\" \"$MNV\"", "\n",

"/opt/aurea/sonic</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>/SDM</xsl:text><xsl:value-of select="$sonicsubdirmajorminor"/><xsl:text>/bin/resetModel.sh data_dir=/aurea/Data/Sonic \"$MODEL\" environment=$MNV", "\n",
"if [ $? != \"0\" ] ; then", "\n",
"        return $?", "\n",
"fi;", "\n",
"#/opt/aurea/sonic</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>/SDM</xsl:text><xsl:value-of select="$sonicsubdirmajorminor"/><xsl:text>/bin/cleanDomain.sh \"$MODEL\" data_dir=/aurea/Data/Sonic hm_wait_time=60 environment=$MNV ", "logical_hosts=\"dshost,dsbakhost,broker1host,broker1bakhost,broker2host,broker2bakhost,pmobrokerhost,pmobrokerbakhost,esb1host,esb2host\"", "\n",
"/opt/aurea/sonic</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>/SDM</xsl:text><xsl:value-of select="$sonicsubdirmajorminor"/><xsl:text>/bin/cleanDomain.sh \"$MODEL\"  data_dir=/aurea/Data/Sonic  hm_wait_time=60 environment=$MNV", "\n",
"if [ $? != \"0\" ] ; then", "\n",
"        return $?", "\n",
"fi;", "\n",
"echo", "\n",
"echo cleanDomain completed. ", "\n",
"echo", "\n"
                ]]},
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
               },
               "/home/ec2-user/prep/installActionalAgent.sh" : {
                "content" : { "Fn::Join" : ["", [
"        echo  \"tbd\"", "\n"
                ]]},
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
               },
               "/home/ec2-user/prep/sonic.twmrc.defs" : {
                "content" : { "Fn::Join" : ["", [
"Button3 = : root : f.menu \"defops2\"", "\n",
"menu \"defops2\"", "\n",
"{", "\n",
"\"Sonic Utilities\" f.title", "\n",
"\"Sonic Management Console\" f.exec \"exec /opt/aurea/sonic2013/MQ8.6/bin/startmc.sh &amp;\"", "\n",
"\"Sonic Workbench\" f.exec \"exec /opt/aurea/sonic2013/Workbench8.6/startworkbench.sh &amp;\"", "\n",
"\"Progaia Message Manager\" f.exec \"exec /usr/bin/java -jar /opt/aurea/sonic2013/MQ8.6/lib/SonicMessageManager.jar &amp;\"", "\n",
"\"Firefox\" f.exec \"exec /usr/bin/firefox &amp;\"", "\n",
"}", "\n"
                ]]},
                "mode"    : "000644",
                "owner"   : "root",
                "group"   : "root"
              },
               "/home/ec2-user/prep/SonicMessageManager.jar" : {
                "source" : "https://s3.amazonaws.com/aurea-test-peaston/Sonic2013/SonicMessageManager.jar",
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
              },
               "/home/ec2-user/prep/jhall.jar" : {
                "source" : "https://s3.amazonaws.com/aurea-test-peaston/Sonic2013/jhall.jar",
                "mode"    : "000644",
                "owner"   : "root",
                "group"   : "root"
              },
               "/aurea/software/actional/AUREA_ACTIONAL_AGENT_2013.0.0.2_LNX.bin" : {
                "source" : "https://s3.amazonaws.com/actional-aurea/dev/archive_build/Management_Server/9.1.0/HotFixes/9.1.0.2/9.1002.40.136_(2013.0.0.2)/Actional_Agent/AUREA_ACTIONAL_AGENT_2013.0.0.2_LNX.bin",
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
              }
            }
</xsl:text><!-- comment this out there is an issue executing the vncserver perl 
script - uname not found - from cfn-init (sudo vncserver manually)
            ,"commands" : {
             "vncpasswd" : {
               "env" : { "HOME" : "/root"},
               "command" : "/usr/bin/vncpasswd &lt;&lt; END\nAurea2013\nAurea2013\nEND\n" 
              },
             "vncserver" : {
               "env" : { "HOME" : "/root"},
               "command" : "/usr/bin/vncserver" 
              }
             }
--><xsl:text>

            },
            "config2" : {
            "files" : {
               "/home/ec2-user/prep/fixHosts.sh" : {
                "content" : { "Fn::Join" : ["", [
"sudo sed -i \"/satellite/d\" /etc/hosts", "\n",
</xsl:text>
<xsl:for-each select="tokenize($numbers,',')">
<xsl:if test="number(.) gt number(1)">
<xsl:if test="number(.) le number($numsonicinstances)">
<xsl:text>
"echo  ", { "Ref" : "MachineInstance</xsl:text><xsl:value-of select="."/><xsl:text>IP"}, "| sed s/\\\\./-/g | awk '{ print  \"ip-\" $1 \".aurea.local\" }' &gt; .t", "\n",  
"sudo echo  ", { "Ref" : "MachineInstance</xsl:text><xsl:value-of select="."/><xsl:text>IP"}, " `cat .t` satellite</xsl:text><xsl:value-of select="number(.) - number(1)"/><xsl:text>  >> /etc/hosts", "\n",
</xsl:text>
</xsl:if>
</xsl:if>
</xsl:for-each>
<xsl:text>
"#last line", "\n"
                ]]},
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
               }, 
               "/home/ec2-user/prep/renewTopology.sh" : {
                "content" : { "Fn::Join" : ["", [
"xform() {", "\n",
"java -classpath /opt/aurea/sonic</xsl:text><xsl:value-of select="$sonicmajorminor"/><xsl:text>/ESB</xsl:text><xsl:value-of select="$sonicsubdirmajorminor"/><xsl:text>/lib/saxon8.jar net.sf.saxon.Transform -o \"$1.out\" -s \"$@\"", "\n",
"}", "\n",
"MODEL=$1" , "\n",
"MNV=$2", "\n",
"if [ -z $2 ] ; then", "\n",
"        MNV=production", "\n",
"fi;", "\n",
"xform \"$MODEL/${MNV}Environment.xml\"  /home/ec2-user/prep/renewTopology.xsl",
</xsl:text>
<xsl:for-each select="tokenize($numbers,',')">
<xsl:if test="number(.) le number($numsonicinstances)">
<xsl:text>
" machine</xsl:text><xsl:value-of select="."/><xsl:text>ip=", {"Ref" : "MachineInstance</xsl:text><xsl:value-of select="."/><xsl:text>IP"} ,
</xsl:text>
</xsl:if>
</xsl:for-each>
<xsl:text>
"\n",
"mv \"$MODEL/productionEnvironment.xml.out\" \"$MODEL/productionEnvironment.xml\"", "\n"
                ]]},
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
               }, 
               "/home/ec2-user/prep/renewTopology.xsl" : {
                "content" : { "Fn::Join" : ["", [
"&lt;xsl:stylesheet version=\"1.0\"", "\n",
" xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\"&gt;", "\n",
"\n",
"    &lt;xsl:output omit-xml-declaration=\"yes\"/&gt;", "\n",
</xsl:text>
<xsl:for-each select="tokenize($numbers,',')">
<xsl:if test="number(.) le number($numsonicinstances)">
<xsl:text>
"    &lt;xsl:param name=\"machine</xsl:text><xsl:value-of select="."/><xsl:text>ip\"/&gt;", "\n",
</xsl:text>
</xsl:if>
</xsl:for-each>
<xsl:text>
"\n",
"    &lt;xsl:template match=\"node()|@*\"&gt;", "\n",
"      &lt;xsl:copy&gt;", "\n",
"         &lt;xsl:apply-templates select=\"node()|@*\"/&gt;", "\n",
"      &lt;/xsl:copy&gt;", "\n",
"    &lt;/xsl:template&gt;", "\n",
"\n",
</xsl:text>
<xsl:for-each select="tokenize($numbers,',')">
<xsl:if test="number(.) le number($numsonicinstances)">
<xsl:text>
"    &lt;xsl:template match=\"Machines/Machine[</xsl:text><xsl:value-of select="."/><xsl:text>]/Id\"&gt;", "\n",
"        &lt;Id&gt;&lt;xsl:value-of select=\"$machine</xsl:text><xsl:value-of select="."/><xsl:text>ip\"/&gt;&lt;/Id&gt;", "\n",
"    &lt;/xsl:template&gt;", "\n",
</xsl:text>
</xsl:if>
</xsl:for-each>
<xsl:text>
"\n",
"    &lt;xsl:template match=\"Parameters\"&gt;", "\n",
"        &lt;Parameters&gt;", "\n",
"          &lt;Parameter&gt;&lt;Id&gt;@Boot@&lt;/Id&gt;&lt;Value&gt;true&lt;/Value&gt;&lt;/Parameter&gt;", "\n",
"        &lt;/Parameters&gt;", "\n",
"    &lt;/xsl:template&gt;", "\n",
"\n",
"&lt;/xsl:stylesheet&gt;", "\n"
                ]]},
                "mode"    : "000644",
                "owner"   : "root",
                "group"   : "root"
               }
            }
            }
           },
           "AWS::CloudFormation::Authentication" : {
            "S3AccessCreds" : {
             "type" : "S3",
             "accessKeyId" : { "Ref" : "AWSAccessKey" },
             "secretKey" : { "Ref" : "AWSSecretKey" },
             "buckets" : [ "Aurea_Software_Transfers", "actional-aurea", "aurea-test-peaston", "sonic-aurea" ]
            }
           }
        },

      "Properties": {
        "DisableApiTermination": "FALSE",
</xsl:text><xsl:choose>
<xsl:when test="$vpcstyle = 'publicsubnetsonly'"><xsl:text>
        "NetworkInterfaces" : [{
          "GroupSet"                 : [{ "Ref" : "SonicInstanceSecurityGroup" }],
          "AssociatePublicIpAddress" : "true",
          "DeviceIndex"              : "0",
          "DeleteOnTermination"      : "true",
          "SubnetId"                 : { "Ref" : "</xsl:text><xsl:value-of select="$publicsubnet"/><xsl:text>" }
        }],
</xsl:text>
</xsl:when>
<xsl:when test="$vpcstyle = 'publicandprivatesubnets'"><xsl:text>
          "SubnetId"                 : { "Ref" : "</xsl:text><xsl:value-of select="$privatesubnet"/><xsl:text>" },
          "SecurityGroupIds"                 : [{ "Ref" : "SonicInstanceSecurityGroup" }],
</xsl:text>
</xsl:when>
<xsl:otherwise>
<xsl:text>
        "SubnetId": "</xsl:text><xsl:value-of select="$docroot/Template/HostClouds/HostCloud/Subnets/Private"/><xsl:text>",
        "SecurityGroupIds": [ "</xsl:text><xsl:value-of select="$docroot/Template/HostClouds/HostCloud/SecurityGroups/DefaultInterior"/><xsl:text>" ],
</xsl:text>
</xsl:otherwise>
</xsl:choose>
<xsl:text>
        "ImageId": "</xsl:text><xsl:value-of select="$AMI"/><xsl:text>",
        "BlockDeviceMappings" : [
          {
            "DeviceName" : "/dev/sdh",
            "Ebs" : { "VolumeSize" : "20" }
          },
          {
            "DeviceName"  : "/dev/sdi",
            "VirtualName" : "ephemeral0"
          }
        ],

        "InstanceType": "</xsl:text><xsl:value-of select="$instancetype"/><xsl:text>",
        "KeyName"  : { "Ref" : "KeyName" },
        "SourceDestCheck": "true",
        "Monitoring": "false",
        "UserData"       : { "Fn::Base64" : { "Fn::Join" : ["", [
          "#!/bin/bash -v\n",
          "mkdir /aurea\n",
          "chmod a+rw /aurea\n",
          "mkfs -t ext4 /dev/xvdl\n",
          "mount /dev/xvdl /aurea\n",
          "sed -i \"/xvd1=/d\" /etc/fstab\n",
          "echo /dev/xvdl /aurea ext4 defaults 0 0 >> /etc/fstab\n",
         
</xsl:text>
<xsl:choose>
<xsl:when test="($linuxbrand ne 'Amazon')">
<xsl:text>
          "cd /home/ec2-user\n",
          "wget https://s3.amazonaws.com/cloudformation-examples/aws-cfn-bootstrap-latest.zip\n",
          "unzip aws-cfn-*.zip\n",
          "cd aws-cfn*\n",
          "python setup.py install\n",
          "easy_install requests\n",
          "cd /home/ec2-user\n",
          "wget http://s3.amazonaws.com/ec2metadata/ec2-metadata\n",
          "chmod a+x  ec2-metadata\n",
          "#manually yum these vnc-server dependencies first since rpm packages are installed first in cfn-init\n",
          "yum install -y xorg-x11-xauth\n",
          "yum install -y xorg-x11-fonts-misc\n",
          "yum install -y libXdmcp\n",
          "yum install -y xorg-x11-twm\n",
          "yum install -y firefox\n",
          "iptables -I INPUT -p tcp -m tcp --dport 2500:9000 -j ACCEPT\n",
          "service iptables save\n",
          "service iptables restart\n",

          "/usr/bin/cfn-init --stack ", { "Ref" : "AWS::StackId" }, " --configsets initial  --resource SonicInstance</xsl:text><xsl:value-of select="$instance"/><xsl:text> --region ", { "Ref" : "AWS::Region" }, "\n",
           "cat /etc/X11/twm/system.twmrc /home/ec2-user/prep/sonic.twmrc.defs > /root/.twmrc\n",
           "export HOMESAV=\"$HOME\"\n",
           "export HOME=\"/root\"\n",
           "/usr/bin/vncpasswd &lt;&lt; END\nAurea2013\nAurea2013\nEND\n" ,
           "/usr/bin/vncserver -geometry 1280x1024\n", 
           "export HOME=\"$HOMESAV\"\n",
</xsl:text>
</xsl:when>
<xsl:otherwise>
<xsl:text>
          "yum update -y aws-cfn-bootstrap\n",
          "#manually yum these vnc-server dependencies first since rpm packages are installed first in cfn-init\n",
          "yum install -y xorg-x11-xauth\n",
          "yum install -y xorg-x11-fonts-misc\n",
          "yum install -y libXdmcp\n",
          "/usr/bin/cfn-init --stack ", { "Ref" : "AWS::StackId" }, " --configsets initial  --resource SonicInstance</xsl:text><xsl:value-of select="$instance"/><xsl:text> --region ", { "Ref" : "AWS::Region" }, "\n",
           "export HOMESAV="\$HOME\"\n",
           "export HOME=\"/root\"\n",
           "/usr/bin/vncpasswd &lt;&lt; END\nAurea2013\nAurea2013\nEND\n" ,
           "/usr/bin/vncserver\n", 
           "export HOME=\"$HOMESAV\"\n",
</xsl:text>
</xsl:otherwise>
</xsl:choose>
<xsl:choose>
<xsl:when test="($instance eq '1')">
<xsl:text>
          "hostname dmmanager\n",
          "sed -i \"/HOSTNAME=/d\" /etc/sysconfig/network\n",
          "echo HOSTNAME=`hostname`>> /etc/sysconfig/network\n",
          "#com.sonicsw.mf.framework.agent.ci.HostHelper looks up ec2 for dyn res\n",
          "echo `curl http://169.254.169.254/latest/meta-data/local-ipv4` `curl http://169.254.169.254/latest/meta-data/local-hostname`  `hostname` >> /etc/hosts\n" ,
          "/home/ec2-user/prep/installDMManager.sh\n",
          "/home/ec2-user/prep/installActionalAgent.sh\n",
          "cp /home/ec2-user/prep/jhall.jar /opt/aurea/sonic2013/MQ8.6/lib\n",
          "cp /home/ec2-user/prep/SonicMessageManager.jar /opt/aurea/sonic2013/MQ8.6/lib\n",
          "cp /opt/aurea/sonic2013/ESB8.6/lib/xq_co* /opt/aurea/sonic2013/SDM8.6/lib\n",
          "cp /opt/aurea/sonic2013/ESB8.6/schema/*  /opt/aurea/sonic2013/SDM8.6/schemas/esb/schema\n"
</xsl:text>
</xsl:when>
<xsl:otherwise>
<xsl:text>
          "hostname satellite</xsl:text><xsl:value-of select="number($instance) - number(1)"/><xsl:text>\n",
          "sed -i \"/HOSTNAME=/d\" /etc/sysconfig/network\n",
          "echo HOSTNAME=`hostname`>> /etc/sysconfig/network\n",
          "#com.sonicsw.mf.framework.agent.ci.HostHelper looks up ec2 for dyn res\n",
          "echo `curl http://169.254.169.254/latest/meta-data/local-ipv4` `curl http://169.254.169.254/latest/meta-data/local-hostname`  `hostname` >> /etc/hosts\n" ,
          "echo  ",{"Fn::GetAtt" : ["SonicInstance1", "PrivateIp"] },"| sed s/\\\\./-/g | awk '{ print  \"ip-\" $1 \".aurea.local\" }' &gt; .t", "\n",  
          "echo ", {"Fn::GetAtt" : ["SonicInstance1", "PrivateIp"] }, " `cat .t` ",  {"Fn::GetAtt" : ["SonicInstance1", "PrivateDnsName"] }, " dmmanager >> /etc/hosts\n", 
          "/home/ec2-user/prep/installHostManager.sh\n",
          "/home/ec2-user/prep/installActionalAgent.sh\n"
</xsl:text>
</xsl:otherwise>
</xsl:choose>
<xsl:text>
        ]]}},
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat('Sonic_Instance',$instance)" />
    <xsl:with-param name="description" select="concat('Sonic_Instance',$instance)" />
</xsl:call-template>
<xsl:text>
      }
    },
</xsl:text>
</xsl:template>



<!-- Main emission starts here -->

<xsl:template match="Template">

<!--

======================= Emit Template Opening Brace and Version ================

-->

<xsl:text>
{
  "AWSTemplateFormatVersion" : "2010-09-09",
</xsl:text>


<!--

===================== Emit Description and Parameters =================

-->

<xsl:text>
  "Description": "Create a Sonic Domain Manager and Host Manager(s) machine setup ready for SDM Model application.",
   "Parameters": {
        "AWSAccessKey": {
            "Description": "Name of AWS Access Key",
            "Type": "String",
            "Default": "</xsl:text><xsl:value-of select="$awsaccesskey"/><xsl:text>"
        },
        "AWSSecretKey": {
            "Description": "Name of AWS Secret Key",
            "Type": "String",
            "Default": "</xsl:text><xsl:value-of select="$awssecretkey"/><xsl:text>"
        },
        "KeyName": {
            "Description": "Name of an existing EC2 KeyPair to enable SSH access to the instances",
            "Type": "String",
            "Default": "</xsl:text><xsl:value-of select="$key"/><xsl:text>"
        },
        "ModelName": {
            "Description": "Name of an SDM Model Zip",
            "Type":  "String",
            "Default": "</xsl:text><xsl:value-of select="$model"/><xsl:text>"
        },
</xsl:text>
<xsl:for-each select="tokenize($numbers,',')">
<xsl:if test="number(.) le number($numsonicinstances)">
<xsl:text>
        "MachineInstance</xsl:text><xsl:value-of select="."/><xsl:text>IP": {
"Description": "MachineInstance</xsl:text><xsl:value-of select="."/><xsl:text>IP",
    "Type": "String",
    "Default": "unassigned"
},
</xsl:text>
</xsl:if>
</xsl:for-each>

<xsl:if test="$vpcstyle != 'hosted'">
<xsl:text>
"SonicVPCCIDR" : {
    "Description" : "VPC CIDR Block",
    "Type" : "String",
    "MinLength": "9",
    "MaxLength": "18",
    "Default" : "</xsl:text><xsl:value-of select="$cidr"/><xsl:text>",
    "AllowedPattern" : "(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})/(\\d{1,2})",
    "ConstraintDescription" : "must be a valid CIDR range of the form x.x.x.x/x."
},
</xsl:text>
<xsl:for-each select="tokenize($availabilityzones,',')">
<xsl:variable name="zoneNo" select="position()" />
<xsl:if test="number($zoneNo) le number($numavailabilityzones)">
<xsl:text>
"SonicZone</xsl:text><xsl:value-of select="$zoneNo"/><xsl:text>PublicCIDR" : {
    "Description" : "VPC Public subnet CIDR Block",
    "Type" : "String",
    "MinLength": "9",
    "MaxLength": "18",
    "Default" : "</xsl:text><xsl:value-of select="$cidrprefix"/><xsl:text>.</xsl:text><xsl:value-of select="($zoneNo*2)-2"/><xsl:text>.0/24",
    "AllowedPattern" : "(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})/(\\d{1,2})",
    "ConstraintDescription" : "must be a valid CIDR range of the form x.x.x.x/x."
},
</xsl:text>
<xsl:if test="not($vpcstyle = 'publicsubnetsonly')">
<xsl:text>
"SonicZone</xsl:text><xsl:value-of select="$zoneNo"/><xsl:text>PrivateCIDR" : {
    "Description" : "VPC Private subnet CIDR Block",
    "Type" : "String",
    "MinLength": "9",
    "MaxLength": "18",
    "Default" : "</xsl:text><xsl:value-of select="$cidrprefix"/><xsl:text>.</xsl:text><xsl:value-of select="($zoneNo*2)-1"/><xsl:text>.0/24",
    "AllowedPattern" : "(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})/(\\d{1,2})",
    "ConstraintDescription" : "must be a valid CIDR range of the form x.x.x.x/x."
},
</xsl:text>
</xsl:if>
 </xsl:if>
</xsl:for-each>
</xsl:if>
<xsl:text>
        "Owner": {
            "Description": "Owner of the stack resources, should be email id in Sonic.com domain",
            "Type": "String",
            "Default": "</xsl:text><xsl:value-of select="$owner"/><xsl:text>"
        },
        "EnvironmentType": {
            "Description": "Environment for which this stack is created",
            "Type": "String",
            "AllowedValues": [
                "Dev",
                "QA",
                "Prod",
                "Other"
            ],
            "Default": "Dev"
        },
        "ProductName": {
            "Description": "Product for which this stack is used",
            "Type": "String",
            "Default": "Sonic"
        },
        "ServiceLine": {
            "Description": "Service line",
            "Type": "String",
            "Default": "Sonic"
        }

  },


</xsl:text>

<!--

===================== Emit Resources ====================

-->

<xsl:text>
  "Resources" : {
</xsl:text>


<!-- emit the Virtual Private Clouds -->

<xsl:if test="$vpcstyle ne 'hosted'">
<xsl:call-template name="emitVirtualPrivateCloud">
    <xsl:with-param name="network" select="'Sonic'" />
    <xsl:with-param name="style" select="$vpcstyle" />
    <xsl:with-param name="availabilityzones" select="$availabilityzones" />
    <xsl:with-param name="nrzones" select="$numavailabilityzones" />
</xsl:call-template>
</xsl:if>

<!-- Emit the Sonic instances -->

<xsl:for-each select="tokenize($numbers,',')">
<xsl:if test="number(.) le number($numsonicinstances)">
<xsl:variable name="pos" select="( (number(.)-number(1)) mod number($numavailabilityzones))+number(1)"/>
<xsl:call-template name="emitSonic">
    <xsl:with-param name="instance" select="." />
    <xsl:with-param name="publicsubnet" select="concat('SonicZone',$pos,'PublicSubnet')" />
    <xsl:with-param name="privatesubnet" select="concat('SonicZone',$pos,'PrivateSubnet')" />
</xsl:call-template>
</xsl:if>
</xsl:for-each>


<!-- Emit AMS, AI, and ATS -->
<xsl:for-each select="tokenize($availabilityzones,',')">
<xsl:variable name="zoneNo" select="position()" />
<xsl:if test="number($zoneNo) le number($numavailabilityzones)">
<xsl:call-template name="emitActional">
    <xsl:with-param name="privatesubnet" select="concat('SonicZone',$zoneNo,'PrivateSubnet')" />
    <xsl:with-param name="publicsubnet" select="concat('SonicZone',$zoneNo,'Public')" />
</xsl:call-template>
</xsl:if>
</xsl:for-each>

<!-- If there are Savvion instances, emit RDS -->

<xsl:if test="number($numsonicinstances) gt 0">
<xsl:call-template name="emitRDS"/>
</xsl:if>

<!-- emit a dummy section so we don't have a trailing comma after
     the last resource -->

<xsl:text>
    "DummyWaitHandle" : {
        "Type" : "AWS::CloudFormation::WaitConditionHandle",
        "Properties" : {
        }
    }
  },

</xsl:text>

<!--

===================== Emit Outputs =================

-->

<xsl:text>
  "Outputs" : {
     "NewUserDataSettings": {
      "Description" : "Successfully generated the following Sonic machines.",
      "Value": {
          "Fn::Join" : ["", [
          "ActionalInstanceIP=",  {"Fn::GetAtt" : ["ActionalInstance", "PrivateIp"]}, "\n",
</xsl:text>
<xsl:for-each select="tokenize($numbers,',')">
<xsl:if test="number(.) lt number($numsonicinstances)">
<xsl:text>
          "MachineInstance</xsl:text><xsl:value-of select="."/><xsl:text>IP=",  {"Fn::GetAtt" : ["SonicInstance</xsl:text><xsl:value-of select="."/><xsl:text>", "PrivateIp"]}, "\n",
</xsl:text>
</xsl:if>
<xsl:if test="$vpcstyle='publicsubnetsonly'">
<xsl:text>
          "MachineInstance</xsl:text><xsl:value-of select="."/><xsl:text>PublicIP=",  {"Fn::GetAtt" : ["SonicInstance</xsl:text><xsl:value-of select="."/><xsl:text>PublicIp"]}, "\n",
</xsl:text>
</xsl:if>
<xsl:if test="number(.) eq number($numsonicinstances)">
<xsl:text>
          "MachineInstance</xsl:text><xsl:value-of select="."/><xsl:text>IP=",  {"Fn::GetAtt" : ["SonicInstance</xsl:text><xsl:value-of select="."/><xsl:text>", "PrivateIp"]}, "\n"
</xsl:text>
<xsl:if test="$vpcstyle='publicsubnetsonly'">
<xsl:text>
          ,"MachineInstance</xsl:text><xsl:value-of select="."/><xsl:text>PublicIP=",  {"Fn::GetAtt" : ["SonicInstance</xsl:text><xsl:value-of select="."/><xsl:text>", "PublicIp"]}, "\n"
</xsl:text>
</xsl:if>
</xsl:if>
</xsl:for-each>
<xsl:text>
 ] ]
       }
      }
    }
</xsl:text>

<!--

===================== Emit Template Closing Brace ===================


-->
<xsl:text>

}
</xsl:text>
</xsl:template>
</xsl:stylesheet>
