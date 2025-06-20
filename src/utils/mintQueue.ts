interface MintRequest {
  id: string;
  address: string;
  quantity: number;
  timestamp: number;
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

class MintQueue {
  private queue: MintRequest[] = [];
  private processing: boolean = false;
  private readonly DELAY_BETWEEN_MINTS = 2000; // 2 seconds between mints
  private readonly MAX_QUEUE_SIZE = 50; // Prevent memory issues

  async addToQueue(address: string, quantity: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check queue size limit
      if (this.queue.length >= this.MAX_QUEUE_SIZE) {
        reject(new Error('Mint queue is full. Please try again later.'));
        return;
      }

      const request: MintRequest = {
        id: `${address}-${Date.now()}-${Math.random()}`,
        address,
        quantity,
        timestamp: Date.now(),
        resolve,
        reject
      };

      this.queue.push(request);
      console.log(`🎯 Added mint request to queue. Position: ${this.queue.length}`);

      // Start processing if not already running
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.processing) return;
    
    this.processing = true;
    console.log('🔄 Starting mint queue processing...');

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (!request) continue;

      try {
        console.log(`⚡ Processing mint for ${request.address} (${request.quantity} NFTs)`);
        
        // Here we would call the actual mint function
        // For now, we'll simulate the mint process
        const result = await this.simulateMint(request);
        request.resolve(result);
        
        console.log(`✅ Mint completed for ${request.address}`);
        
        // Add delay between mints to prevent overwhelming the network
        if (this.queue.length > 0) {
          console.log(`⏳ Waiting ${this.DELAY_BETWEEN_MINTS}ms before next mint...`);
          await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_MINTS));
        }
        
      } catch (error) {
        console.error(`❌ Mint failed for ${request.address}:`, error);
        request.reject(error);
      }
    }

    this.processing = false;
    console.log('✅ Queue processing completed');
  }

  private async simulateMint(request: MintRequest): Promise<any> {
    // This is where the actual mint logic would go
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      address: request.address,
      quantity: request.quantity,
      timestamp: Date.now()
    };
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      nextPosition: this.queue.length + 1
    };
  }

  // Method to integrate with actual mint function
  setMintFunction(mintFn: (address: string, quantity: number) => Promise<any>) {
    this.simulateMint = async (request: MintRequest) => {
      return await mintFn(request.address, request.quantity);
    };
  }
}

// Export singleton instance
export const mintQueue = new MintQueue();
export default mintQueue; 