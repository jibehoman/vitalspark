<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:saxon="http://saxon.sf.net/"
>
<!-- stylesheet to generate cloudformation variants
-->
<xsl:output method="text" omit-xml-declaration="yes"  indent="no" />
<!-- 


Actional Emiter

-->


<xsl:template name="emitActional">
    <xsl:param name="publicsubnet" />
    <xsl:param name="privatesubnet" />
<xsl:text>
    "ActionalInstance": {
      "Type": "AWS::EC2::Instance",
      "Metadata" : {

        "AWS::CloudFormation::Init" : {
          "configSets" : {
            "initial" : [ "config1" ],
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
            },
            "files" : {
               "/home/ec2-user/prep/sst.properties" : {
                "content" : { "Fn::Join" : ["", [
"INSTALLER_UI=silent", "\n",
"USER_INSTALL_DIR=/opt/aurea/actional/ActionalSST", "\n",
"debug.file=/opt/aurea/actional/ActionalSST/ActionalSSTInstall.log", "\n",
"enable.buttongroup=false", "\n",
"debug.mode=true", "\n",
"install.set=full", "\n",
"sst.jetty=true", "\n",
"docs.all=true", "\n",
"port.http=8620", "\n",
"port.https=8621", "\n"
                ]]},
                "mode"    : "000644",
                "owner"   : "root",
                "group"   : "root"
               },
               "/home/ec2-user/prep/installActionalManagementServer.sh" : {
                "content" : { "Fn::Join" : ["", [
"        echo  \"tbd\"", "\n"
                ]]},
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
               },
               "/home/ec2-user/prep/installActionalIntermediary.sh" : {
                "content" : { "Fn::Join" : ["", [
"echo FHHFU-S6ULB-T9ZLR-9DC4Q-UXJTY-469P7", "\n",
"/aurea/software/actional/AUREA_ACTIONAL_INTERMEDIARY_2013.0.0.2_LNX.bin -f /home/ec2-user/prep/sst.properties", "\n" 
                ]]},
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
               },
               "/home/ec2-user/prep/installActionalTeamServer.sh" : {
                "content" : { "Fn::Join" : ["", [
"        echo  \"2P8s-lnxT-tXN6-Eo76-Q3eA-/8fo-pwSr-5oJU\"", "\n"
                ]]},
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
               },
               "/home/ec2-user/prep/debugActionalIntermediary.sh" : {
                "content" : { "Fn::Join" : ["", [
          "#!/bin/bash -v\n",
          "export ACTIONAL_JAVA_OPTS=\"-Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,suspend=n,server=y,address=7996\"\n",
          "/opt/aurea/actional/ActionalSST/DefaultProfile/bin/StartActionalIntermediary.sh\n"
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
"\"Actional Utilities\" f.title", "\n",
"\"Start Intermediary\" f.exec \"exec /home/ec2-user/prep/debugActionalIntermediary.sh &amp;\"", "\n",
"\"Stop Intermediary\" f.exec \"exec /opt/aurea/actional/ActionalSST/DefaultProfile/bin/StopActionalIntermediary &amp;\"", "\n",
"\"Start TeamServer\" f.exec \"exec /opt/aurea/actional/ActionalTeamServer/ActionalTeamServer start&amp;\"", "\n",
"\"Stop TeamServer\" f.exec \"exec /opt/aurea/actional/ActionalTeamServer/ActionalTeamServer stop&amp;\"", "\n",
"\"Firefox\" f.exec \"exec /usr/bin/firefox &amp;\"", "\n",
"}", "\n"
                ]]},
                "mode"    : "000644",
                "owner"   : "root",
                "group"   : "root"
              },
               "/aurea/software/actional/AUREA_ACTIONAL_MANAGEMENT_SERVER_2013.0.0.2_LNX.bin" : {
                "source" : "https://s3.amazonaws.com/actional-aurea/dev/archive_build/Management_Server/9.1.0/HotFixes/9.1.0.2/9.1002.40.136_(2013.0.0.2)/Actional_Management_Server/AUREA_ACTIONAL_MANAGEMENT_SERVER_2013.0.0.2_LNX.bin",
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
              },
               "/aurea/software/actional/AUREA_ACTIONAL_INTERMEDIARY_2013.0.0.2_LNX.bin" : {
                "source" : "https://s3.amazonaws.com/actional-aurea/dev/archive_build/Management_Server/9.1.0/HotFixes/9.1.0.2/9.1002.40.136_(2013.0.0.2)/Actional_Intermediary/AUREA_ACTIONAL_INTERMEDIARY_2013.0.0.2_LNX.bin",
                "mode"    : "000755",
                "owner"   : "root",
                "group"   : "root"
              },
               "/aurea/software/actional/PROGRESS_ACTIONAL_TEAM_SERVER_9.0.0_LNX.bin" : {
                "source" : "https://s3.amazonaws.com/actional-aurea/dev/archive_build/Team_Server/9.0.0/FCS/20121204_1713/PROGRESS_ACTIONAL_TEAM_SERVER_9.0.0_LNX.bin",
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

          "/usr/bin/cfn-init --stack ", { "Ref" : "AWS::StackId" }, " --configsets initial  --resource Actionalnstance --region ", { "Ref" : "AWS::Region" }, "\n",
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
          "/usr/bin/cfn-init --stack ", { "Ref" : "AWS::StackId" }, " --configsets initial  --resource ActionalInstance --region ", { "Ref" : "AWS::Region" }, "\n",
           "export HOMESAV="\$HOME\"\n",
           "export HOME=\"/root\"\n",
           "/usr/bin/vncpasswd &lt;&lt; END\nAurea2013\nAurea2013\nEND\n" ,
           "/usr/bin/vncserver\n", 
           "export HOME=\"$HOMESAV\"\n",
</xsl:text>
</xsl:otherwise>
</xsl:choose>
<xsl:text>
          "hostname actionalmanager\n",
          "sed -i \"/HOSTNAME=/d\" /etc/sysconfig/network\n",
          "echo HOSTNAME=`hostname`>> /etc/sysconfig/network\n",
          "#com.sonicsw.mf.framework.agent.ci.HostHelper looks up ec2 for dyn res\n",
          "echo `curl http://169.254.169.254/latest/meta-data/local-ipv4` `curl http://169.254.169.254/latest/meta-data/local-hostname`  `hostname` >> /etc/hosts\n" ,
          "/home/ec2-user/prep/installActionalManagementServer.sh\n",
          "/home/ec2-user/prep/installActionalTeamServer.sh\n",
          "/home/ec2-user/prep/installActionalIntermediary.sh\n",
        ]]}},
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="'Actional_Instance'" />
    <xsl:with-param name="description" select="'Actional_Instance'" />
</xsl:call-template>
<xsl:text>
      }
    },
</xsl:text>
</xsl:template>
</xsl:stylesheet>
