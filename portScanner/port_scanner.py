import socket
import re
# We want to import the dictionary matching service names to port numbers
import common_ports
common_ports=common_ports.ports_and_services

def get_open_ports(target, port_range, verbose = False):
    open_ports = []
    # We are passed either an ip address or a hostname. Try to connect via either of them
    # If target is a hostname, convert it to an ip
    ## Test using regex if an ip address was the format of the target
    target_ip=''
    target_hostname=''
    if re.search("^\d\d?\d?.\d\d?\d?.\d\d?\d?.\d\d?\d?$", target):
        target_ip=target
        if not re.search("^([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]).([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]).([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]).([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$",target):
            return 'Error: Invalid IP address'
        try:
            target_hostname=socket.gethostbyaddr(target)[0]
        except: 
            target_hostname=""
    else:
        target_hostname=target
        try:
            target_ip=str(socket.gethostbyname(target));
        except: 
            return "Error: Invalid hostname" 
    # Look for all the ports that we want 
    for port in range(port_range[0],port_range[-1]+1):
        # Check to see if that's in the dictionary
        if port in common_ports:
            # If that port is open
            s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
            s.settimeout(10)
            try:
                s.connect((target_ip,port))
                open_ports.append(port)
                
            except socket.error as e: 
                print('Error: ',e)
            finally:
                s.close()
    # Check to see if verbose was set to true. If not, return the list. Otherwise return our list
    if not verbose:
        return(open_ports);
    # Construct string for ports 
    if target_hostname:
        verbose_ports='Open ports for '+target_hostname+" ("+target_ip+")\n"
    else:
        verbose_ports='Open ports for '+target_ip+"\n"
    verbose_ports+='PORT     SERVICE'
    
    for port in open_ports:
        verbose_ports+=f"\n{port:<5}    {common_ports.get(port):<}"

    return verbose_ports

# Test case
print(get_open_ports("scanme.nmap.org", [20, 80], False))