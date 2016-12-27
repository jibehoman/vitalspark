<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:saxon="http://saxon.sf.net/"
>
<!-- stylesheet to generate cloudformation variants
-->
<xsl:output method="text" omit-xml-declaration="yes"  indent="no" />



<!-- 

NAT Emiter

-->

<xsl:template name="emitNAT">
    <xsl:param name="network" />
    <xsl:param name="subnet" />
<xsl:text>

    "</xsl:text><xsl:value-of select="$subnet"/><xsl:text>NATIPAddress" : {
      "Type" : "AWS::EC2::EIP",
      "DependsOn" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>GatewayToInternet",
      "Properties" : {
        "Domain" : "vpc",
        "InstanceId" : { "Ref" : "</xsl:text><xsl:value-of select="$subnet"/><xsl:text>NATDevice" }
       }
    },

    "</xsl:text><xsl:value-of select="$subnet"/><xsl:text>NATDevice" : {
      "Type" : "AWS::EC2::Instance",
      "Properties" : {
        "InstanceType" : "m1.small",
        "SubnetId" : { "Ref" : "</xsl:text><xsl:value-of select="$subnet"/><xsl:text>" },
        "SourceDestCheck" : "false",
        "ImageId" : "ami-c6699baf",
        "SecurityGroupIds" : [{ "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>NATSecurityGroup" }],
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($subnet,'NATDevice')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($subnet,'NATDevice')" />
</xsl:call-template>
<xsl:text>
      }
    },
</xsl:text>
</xsl:template>

<!-- 

NATSecurityGroup Emiter

-->

<xsl:template name="emitNATSecurityGroup">
    <xsl:param name="network" />
<xsl:text>

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>NATSecurityGroup" : {
      "Type" : "AWS::EC2::SecurityGroup",
      "Properties" : {
        "GroupDescription" : "Enable internal access to the NAT device",
        "VpcId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPC" },
        "SecurityGroupIngress" : [
           { "IpProtocol" : "tcp", "FromPort" : "1521",  "ToPort" : "1521",  "CidrIp" : "0.0.0.0/0" } ,
           { "IpProtocol" : "tcp", "FromPort" : "80",  "ToPort" : "80",  "CidrIp" : "0.0.0.0/0" } ,
           { "IpProtocol" : "tcp", "FromPort" : "443", "ToPort" : "443", "CidrIp" : "0.0.0.0/0" } ],
        "SecurityGroupEgress" : [
           { "IpProtocol" : "tcp", "FromPort" : "1521",  "ToPort" : "1521",  "CidrIp" : "0.0.0.0/0" } ,
           { "IpProtocol" : "tcp", "FromPort" : "80",  "ToPort" : "80",  "CidrIp" : "0.0.0.0/0" } ,
           { "IpProtocol" : "tcp", "FromPort" : "443", "ToPort" : "443", "CidrIp" : "0.0.0.0/0" } ],
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'NATSecurityGroup')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,'NATSecurityGroup')" />
</xsl:call-template>
<xsl:text>
      }
    },
</xsl:text>
</xsl:template>


<!-- 

Bastion Emiter

-->

<xsl:template name="emitBastion">
    <xsl:param name="network" />
    <xsl:param name="subnet" />
    <xsl:param name="style" />
<xsl:if test="$style = 'publicandprivatesubnets'">
<xsl:text>

    "</xsl:text><xsl:value-of select="$subnet"/><xsl:text>BastionIPAddress" : {
      "Type" : "AWS::EC2::EIP",
      "DependsOn" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>GatewayToInternet",
      "Properties" : {
        "Domain" : "vpc",
        "InstanceId" : { "Ref" : "</xsl:text><xsl:value-of select="$subnet"/><xsl:text>BastionHost" }
      }
    },
</xsl:text>
</xsl:if>
<xsl:text>

    "</xsl:text><xsl:value-of select="$subnet"/><xsl:text>BastionHost" : {
      "Type" : "AWS::EC2::Instance",
      "Properties" : {
</xsl:text>
<xsl:choose>
<xsl:when test="$style = 'publicsubnetsonly'"><xsl:text>
        "NetworkInterfaces" : [{
          "GroupSet"                 : [{ "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>BastionSecurityGroup" }],
          "AssociatePublicIpAddress" : "true",
          "DeviceIndex"              : "0",
          "DeleteOnTermination"      : "true",
          "SubnetId"                 : { "Ref" : "</xsl:text><xsl:value-of select="$subnet"/><xsl:text>" }
        }],
</xsl:text></xsl:when>
<xsl:otherwise><xsl:text>
          "SubnetId"                 : { "Ref" : "</xsl:text><xsl:value-of select="$subnet"/><xsl:text>" },
          "SecurityGroupIds"                 : [{ "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>BastionSecurityGroup" }],
</xsl:text>
</xsl:otherwise>
</xsl:choose>
<xsl:text>
        "InstanceType" : "m1.small",
        "KeyName"  : { "Ref" : "KeyName" },
        "ImageId"  : "ami-aecd60c7",
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($subnet,'BastionHost')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($subnet,'Bastion Host')" />
</xsl:call-template>
<xsl:text>
      }
    },
</xsl:text>
</xsl:template>


<!-- 

BastionSecurityGroup Emiter

-->

<xsl:template name="emitBastionSecurityGroup">
    <xsl:param name="network" />
<xsl:text>

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>BastionSecurityGroup" : {
      "Type" : "AWS::EC2::SecurityGroup",
      "Properties" : {
        "GroupDescription" : "Enable access to the Bastion host",
        "VpcId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPC" },
        "SecurityGroupIngress" : [ { "IpProtocol" : "tcp", "FromPort" : "22",  "ToPort" : "22",  "CidrIp" : "0.0.0.0/0"} ],
        "SecurityGroupEgress"  : [ { "IpProtocol" : "tcp", "FromPort" : "22",  "ToPort" : "22",  "CidrIp" : "0.0.0.0/0"} ],
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'BastionSecurityGroup')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,'Bastion SecurityGroup')" />
</xsl:call-template>
<xsl:text>
      }
    },
</xsl:text>
</xsl:template>


<!-- 

InstanceSecurityGroup Emiter

-->

<xsl:template name="emitInstanceSecurityGroup">
    <xsl:param name="network" />
<xsl:text>

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>InstanceSecurityGroup" : {
      "Type" : "AWS::EC2::SecurityGroup",
      "Properties" : {
        "GroupDescription" : "Instance security",
        "VpcId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPC" },
        "SecurityGroupIngress" : [ 
           { "IpProtocol" : "tcp", "FromPort" : "22", "ToPort" : "22", "SourceSecurityGroupId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>BastionSecurityGroup" } },
           { "IpProtocol" : "tcp", "FromPort" : "0", "ToPort" : "65535", "CidrIp" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPCCIDR" } }
 ],
        "SecurityGroupEgress" : [
           { "IpProtocol" : "tcp", "FromPort" : "0",  "ToPort" : "65535",  "CidrIp" : "0.0.0.0/0" } ],
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'InstanceSecurityGroup')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,'Instance SecurityGroup')" />
</xsl:call-template>
<xsl:text>

      }
    },
</xsl:text>
</xsl:template>


<!-- 

Subnet Emiter

-->

<xsl:template name="emitSubnet">
    <xsl:param name="network" />
    <xsl:param name="zone" />
    <xsl:param name="az" />
    <xsl:param name="category" />
    <xsl:param name="style" />
<xsl:text>
     "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:value-of select="$category"/><xsl:text>Subnet" : {
      "Type" : "AWS::EC2::Subnet",
      "Properties" : {
        "AvailabilityZone" : "</xsl:text><xsl:value-of select="$az"/><xsl:text>",
        "VpcId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPC" },
        "CidrBlock" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:value-of select="$category"/><xsl:text>CIDR" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,$zone,$category,'Subnet')" />
    <xsl:with-param name="network" select="$category" />
    <xsl:with-param name="description" select="concat($network,$zone,$category,'Subnet')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:value-of select="$category"/><xsl:text>SubnetNetworkAclAssociation" : {
      "Type" : "AWS::EC2::SubnetNetworkAclAssociation",
      "Properties" : {
        "SubnetId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:value-of select="$category"/><xsl:text>Subnet" },
        "NetworkAclId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$category"/><xsl:text>NetworkAcl" }
      }
    },
</xsl:text>


<xsl:if test="$category!='Private'">
<!-- All public subnets share a single route table -->
<xsl:text>
    "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:value-of select="$category"/><xsl:text>SubnetRouteTableAssociation" : {
      "Type" : "AWS::EC2::SubnetRouteTableAssociation",
      "Properties" : {
        "SubnetId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:value-of select="$category"/><xsl:text>Subnet" },
        "RouteTableId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$category"/><xsl:text>RouteTable" }
      }
    },
</xsl:text>
</xsl:if>

<xsl:if test="$category='Private'" >
<!-- All private subnets have a dedicated route table  pointing to a dedicated
     zone specific NAT -->

<!-- Emit NAT route -->
<xsl:text>
    "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:text>PrivateRouteTable" : {
      "Type" : "AWS::EC2::RouteTable",
      "Properties" : {
        "VpcId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPC" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,$zone,'PrivateRouteTable')" />
    <xsl:with-param name="network" select="'Private'" />
    <xsl:with-param name="description" select="concat($network,$zone,'Private Route Table')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:text>PrivateRouteToNAT" : {
      "Type" : "AWS::EC2::Route",
      "DependsOn" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>GatewayToInternet",
      "Properties" : {
        "RouteTableId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:text>PrivateRouteTable" },
        "DestinationCidrBlock" : "0.0.0.0/0",
        "InstanceId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:text>PublicSubnetNATDevice" }
      }
    },


    "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:value-of select="$category"/><xsl:text>SubnetRouteTableAssociation" : {
      "Type" : "AWS::EC2::SubnetRouteTableAssociation",
      "Properties" : {
        "SubnetId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:value-of select="$category"/><xsl:text>Subnet" },
        "RouteTableId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:value-of select="$zone"/><xsl:value-of select="$category"/><xsl:text>RouteTable" }
     }
    },

</xsl:text>
</xsl:if>

<xsl:if test="$category='Public'" >
<xsl:call-template name="emitBastion">
    <xsl:with-param name="subnet" select="concat($network,$zone,$category,'Subnet')" />
    <xsl:with-param name="network" select="$network" />
    <xsl:with-param name="style" select="$style" />
</xsl:call-template>

<xsl:if test="$style = 'publicandprivatesubnets'">
<xsl:call-template name="emitNAT">
    <xsl:with-param name="subnet" select="concat($network,$zone,$category,'Subnet')" />
    <xsl:with-param name="network" select="$network" />
</xsl:call-template>
</xsl:if>

</xsl:if>

</xsl:template>

<!-- 

VPC Emiter

-->

<xsl:template name="emitVirtualPrivateCloud">
    <xsl:param name="network" />
    <xsl:param name="style" />
    <xsl:param name="availabilityzones" />
    <xsl:param name="nrzones" />
<xsl:text>
    "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPC" : {
      "Type" : "AWS::EC2::VPC",
      "Properties" : {
        "CidrBlock" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPCCIDR" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'VPC')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,' VPC')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>InternetGateway" : {
      "Type" : "AWS::EC2::InternetGateway",
      "Properties" : {
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'InternetGateway')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,' Internet Gateway')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>GatewayToInternet" : {
       "Type" : "AWS::EC2::VPCGatewayAttachment",
       "Properties" : {
         "VpcId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPC" },
         "InternetGatewayId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>InternetGateway" }
       }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>PublicRouteTable" : {
      "Type" : "AWS::EC2::RouteTable",
      "Properties" : {
        "VpcId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPC" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'PublicRouteTable')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,' Public RouteTable')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>PublicRoute" : {
      "Type" : "AWS::EC2::Route",
      "DependsOn" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>GatewayToInternet",
      "Properties" : {
        "RouteTableId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>PublicRouteTable" },
        "DestinationCidrBlock" : "0.0.0.0/0",
        "GatewayId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>InternetGateway" }
      }
    },


    "</xsl:text><xsl:value-of select="$network"/><xsl:text>PublicNetworkAcl" : {
      "Type" : "AWS::EC2::NetworkAcl",
      "Properties" : {
        "VpcId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPC" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'PublicNetworkAcl')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,'Public Network Acl')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>InboundHTTPPublicNetworkAclEntry" : {
      "Type" : "AWS::EC2::NetworkAclEntry",
      "Properties" : {
        "NetworkAclId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>PublicNetworkAcl" },
        "RuleNumber" : "100",
        "Protocol" : "6",
        "RuleAction" : "allow",
        "Egress" : "false",
        "CidrBlock" : "0.0.0.0/0",
        "PortRange" : { "From" : "80", "To" : "80" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'InboundHTTPPublicNetworkAclEntry')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,'Inbound HTTP Public NetworkAclEntry')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>InboundHTTPSPublicNetworkAclEntry" : {
      "Type" : "AWS::EC2::NetworkAclEntry",
      "Properties" : {
        "NetworkAclId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>PublicNetworkAcl" },
        "RuleNumber" : "101",
        "Protocol" : "6",
        "RuleAction" : "allow",
        "Egress" : "false",
        "CidrBlock" : "0.0.0.0/0",
        "PortRange" : { "From" : "443", "To" : "443" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'InboundHTTPSPublicNetworkAclEntry ')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,'Inbound HTTPS PublicNetworkAclEntry')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>InboundSSHPublicNetworkAclEntry" : {
      "Type" : "AWS::EC2::NetworkAclEntry",
      "Properties" : {
        "NetworkAclId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>PublicNetworkAcl" },
        "RuleNumber" : "102",
        "Protocol" : "6",
        "RuleAction" : "allow",
        "Egress" : "false",
        "CidrBlock" : "0.0.0.0/0",
        "PortRange" : { "From" : "22", "To" : "22" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'InboundSSHPublicNetworkAclEntry')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,'Inbound SSH PublicNetworkAclEntry')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>InboundEmphemeralPublicNetworkAclEntry" : {
      "Type" : "AWS::EC2::NetworkAclEntry",
      "Properties" : {
        "NetworkAclId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>PublicNetworkAcl" },
        "RuleNumber" : "103",
        "Protocol" : "6",
        "RuleAction" : "allow",
        "Egress" : "false",
        "CidrBlock" : "0.0.0.0/0",
        "PortRange" : { "From" : "1024", "To" : "65535" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'InboundEmphemeralPublicNetworkAclEntry')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,'Inbound Emphemeral PublicNetworkAclEntry')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>OutboundPublicNetworkAclEntry" : {
      "Type" : "AWS::EC2::NetworkAclEntry",
      "Properties" : {
        "NetworkAclId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>PublicNetworkAcl" },
        "RuleNumber" : "100",
        "Protocol" : "-1",
        "RuleAction" : "allow",
        "Egress" : "true",
        "CidrBlock" : "0.0.0.0/0",
        "PortRange" : { "From" : "0", "To" : "65535" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'OutboundPublicNetworkAclEntry')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,'Outbound PublicNetworkAclEntry')" />
</xsl:call-template>
<xsl:text>
      }
    },

</xsl:text>

<xsl:if test="$style = 'publicandprivatesubnets'">
<xsl:text>

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>PrivateNetworkAcl" : {
      "Type" : "AWS::EC2::NetworkAcl",
      "Properties" : {
        "VpcId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>VPC" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'PrivateNetworkAcl')" />
    <xsl:with-param name="network" select="'Private'" />
    <xsl:with-param name="description" select="concat($network,'Private Network Acl')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>InboundPrivateNetworkAclEntry" : {
      "Type" : "AWS::EC2::NetworkAclEntry",
      "Properties" : {
        "NetworkAclId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>PrivateNetworkAcl" },
        "RuleNumber" : "100",
        "Protocol" : "6",
        "RuleAction" : "allow",
        "Egress" : "false",
        "CidrBlock" : "0.0.0.0/0",
        "PortRange" : { "From" : "0", "To" : "65535" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'InboundPrivateNetworkAclEntry')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,'Inbound PrivateNetworkAclEntry')" />
</xsl:call-template>
<xsl:text>
      }
    },

    "</xsl:text><xsl:value-of select="$network"/><xsl:text>OutboundPrivateNetworkAclEntry" : {
      "Type" : "AWS::EC2::NetworkAclEntry",
      "Properties" : {
        "NetworkAclId" : { "Ref" : "</xsl:text><xsl:value-of select="$network"/><xsl:text>PrivateNetworkAcl" },
        "RuleNumber" : "100",
        "Protocol" : "6",
        "RuleAction" : "allow",
        "Egress" : "true",
        "CidrBlock" : "0.0.0.0/0",
        "PortRange" : { "From" : "0", "To" : "65535" },
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="concat($network,'OutboundPrivateNetworkAclEntry')" />
    <xsl:with-param name="network" select="'Public'" />
    <xsl:with-param name="description" select="concat($network,'Outbound PrivateNetworkAclEntry')" />
</xsl:call-template>
<xsl:text>
      }
    },

</xsl:text>
</xsl:if>

<xsl:for-each select="tokenize($availabilityzones,',')">
<xsl:variable name="countNo" select="position()" />
<xsl:if test="number($countNo) le number($nrzones)">
<xsl:call-template name="emitSubnet">
    <xsl:with-param name="network" select="$network" />
    <xsl:with-param name="zone" select="concat('Zone',$countNo)" />
    <xsl:with-param name="az" select="." />
    <xsl:with-param name="category" select="'Public'" />
    <xsl:with-param name="style" select="$style" />
</xsl:call-template>
<xsl:if test="$style = 'publicandprivatesubnets'">
<xsl:call-template name="emitSubnet">
    <xsl:with-param name="network" select="$network" />
    <xsl:with-param name="zone" select="concat('Zone',$countNo)" />
    <xsl:with-param name="az" select="." />
    <xsl:with-param name="category" select="'Private'" />
    <xsl:with-param name="style" select="$style" />
</xsl:call-template>
</xsl:if>
</xsl:if>
</xsl:for-each>

<xsl:call-template name="emitBastionSecurityGroup">
    <xsl:with-param name="network" select="$network" />
</xsl:call-template>

<xsl:if test="$style = 'publicandprivatesubnets'">
<xsl:call-template name="emitNATSecurityGroup">
    <xsl:with-param name="network" select="$network" />
</xsl:call-template>
</xsl:if>

<xsl:if test="$network = 'Sonic'">
<xsl:call-template name="emitInstanceSecurityGroup">
    <xsl:with-param name="network" select="$network" />
</xsl:call-template>
</xsl:if>

</xsl:template>

</xsl:stylesheet>
