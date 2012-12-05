	
# Temporary records use redis to connect
module TemporaryRecord
	module ClassMethods

		def connection
			Rails.logger.debug "Connected to redis" unless Rails.nil?
			Redis.new :host => "127.0.0.1", :port => 6379
		end # connection

		def find key
			deserialize Hash[connection.hkeys(hash_key key).map do |k|
				[k, connection.hget(hash_key(key), k)]	
			end] # each k
		end # find

		def deserialize hash
			throw "Implement Me!"
		end # deserialize

		def hash_key key 
			self.class.to_s + key.to_s
		end # generate_key
	end # class
	def self.included(base)
		base.extend ClassMethods
	end # included

	def persist
		flag = true
		serialize.each do |k, v|
			flag &&= self.class.connection.hset self.class.hash_key(key), k, v
		end # serialize
		flag
	end # save

	def key
		throw "Implement Me!"
	end # key

	def serialize
		throw "Implement Me!"
	end # serialize

	
end # TemporaryRecord