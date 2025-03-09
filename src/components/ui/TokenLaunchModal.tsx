import React, { useState } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { PlusCircle } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { Slider } from './slider';

const TokenLaunchModal: React.FC = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("1000000");
  const [startPrice, setStartPrice] = useState("0.0001");
  const [maxPrice, setMaxPrice] = useState("0.001");
  const [curveFactor, setCurveFactor] = useState([50]);
  const [twitterLink, setTwitterLink] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");

  const handleLaunch = () => {
    // TODO: Implement token launch logic
    console.log("Launching token:", {
      tokenName,
      tokenSymbol,
      initialSupply,
      startPrice,
      maxPrice,
      curveFactor,
      twitterLink,
      telegramLink,
      websiteLink
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Launch Token
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Launch New Token</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenName">Token Name</Label>
              <Input
                id="tokenName"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="Enter token name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenSymbol">Token Symbol</Label>
              <Input
                id="tokenSymbol"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                placeholder="Enter token symbol"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialSupply">Initial Supply</Label>
              <Input
                id="initialSupply"
                type="number"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
                placeholder="Enter initial supply"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="parameters" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startPrice">Start Price (SOL)</Label>
              <Input
                id="startPrice"
                type="number"
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value)}
                placeholder="Enter start price"
                step="0.000001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price (SOL)</Label>
              <Input
                id="maxPrice"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Enter max price"
                step="0.000001"
              />
            </div>
            <div className="space-y-2">
              <Label>Curve Factor</Label>
              <Slider
                value={curveFactor}
                onValueChange={setCurveFactor}
                max={100}
                step={1}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitterLink">Twitter Link</Label>
              <Input
                id="twitterLink"
                value={twitterLink}
                onChange={(e) => setTwitterLink(e.target.value)}
                placeholder="Enter Twitter link"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegramLink">Telegram Link</Label>
              <Input
                id="telegramLink"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                placeholder="Enter Telegram link"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteLink">Website Link</Label>
              <Input
                id="websiteLink"
                value={websiteLink}
                onChange={(e) => setWebsiteLink(e.target.value)}
                placeholder="Enter website link"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button onClick={handleLaunch}>Launch Token</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenLaunchModal; 